import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  EventService,
  EventType,
  ChainType,
  createServices,
  MemoryStorageService,
  ProcessEventService,
  type EventPayload,
} from '@ergo-tools/service';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/server';
import { GetMyWatcherStatsTool } from '../src/get-my-watcher-stats.tool.js';

class TestProcessor extends ProcessEventService {
  events: EventPayload<object>[] = [];
  run: (event: EventPayload<object>) => Promise<void> = async () => {};

  constructor() {
    super({ sendEvent: async () => {} }, new MemoryStorageService());
  }

  override async processEvent(event: EventPayload<object>): Promise<void> {
    this.events.push(event);
    await this.run(event);
  }
}

async function setup(t: import('node:test').TestContext, timeoutMs = 1000) {
  const events = new EventService();
  const processor = new TestProcessor();
  const server = new McpServer({ name: 'test', version: '1.0.0' });
  new GetMyWatcherStatsTool(events, processor, timeoutMs).register(server);
  const client = new Client({ name: 'test', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });
  return { events, processor, client };
}

const permit = (address: string, count: number) => ({
  address, wid: `wid-${address}`, chainType: ChainType.Ergo,
  lockedRSN: 100, activeLockedRSN: 20,
  permitCount: count, activePermitCount: 1,
});

const expectedPermit = (address: string, count: number) => ({
  address, chainType: 'Ergo', permitCount: count, activePermitCount: 1,
});

test('refreshes permits for multiple addresses and validates input', async (t) => {
  const { events, processor, client } = await setup(t);
  processor.run = async () => {
    await events.sendEventWithData(EventType.PermitsChanged, [permit('a', 1)]);
    await events.sendEventWithData(EventType.PermitsChanged, [permit('a', 2), permit('b', 3), permit('c', 4)]);
    await events.sendEventWithData(EventType.MyWatcherStatsRequestFinished, ['b', 'a']);
    await events.sendEventWithData(EventType.PermitsChanged, [permit('a', 99)]);
  };
  const result = await client.callTool({
    name: 'get_my_watcher_stats', arguments: { addresses: [' a ', 'b'] },
  });
  const expected = [expectedPermit('a', 2), expectedPermit('b', 3)];
  assert.deepEqual(result.structuredContent, { permits: expected });
  assert.deepEqual(result.content, [{ type: 'text', text: JSON.stringify(expected) }]);
  assert.deepEqual(processor.events, [{
    type: EventType.MyWatcherStatsRequested, data: { addresses: ['a', 'b'] },
  }]);

  processor.run = async () => {
    await events.sendEventWithData(EventType.PermitsChanged, [permit('b', 3)]);
    await events.sendEventWithData(EventType.MyWatcherStatsRequestFinished, ['b']);
  };
  assert.deepEqual((await client.callTool({
    name: 'get_my_watcher_stats', arguments: { address: 'b' },
  })).structuredContent, { permits: [expectedPermit('b', 3)] });

  processor.run = async () => {
    await events.sendEventWithData(EventType.PermitsChanged, []);
    await events.sendEventWithData(EventType.MyWatcherStatsRequestFinished, ['a']);
  };
  assert.deepEqual((await client.callTool({
    name: 'get_my_watcher_stats', arguments: { addresses: ['a'] },
  })).structuredContent, { permits: [] });
  for (const input of [{}, { address: '' }, { address: '  ' }, { addresses: [] },
    { addresses: ['a', '  '] }, { address: 'a', addresses: ['a'] }]) {
    assert.equal((await client.callTool({
      name: 'get_my_watcher_stats', arguments: input,
    })).isError, true);
  }
  assert.equal(processor.events.length, 3);
});

test('event processing preserves default error handling and can propagate failures', async () => {
  const processor = new ProcessEventService(
    { sendEvent: async () => {} }, new MemoryStorageService(),
  );
  const event = { type: EventType.MyWatcherStatsRequested };
  await assert.doesNotReject(processor.processEvent(event));
  await assert.rejects(processor.processEvent(event, { throwOnError: true }));
});

test('reports missing snapshots and processing errors instead of returning cached events', async (t) => {
  const { events, processor, client } = await setup(t);
  await events.sendEventWithData(EventType.PermitsChanged, [permit('a', 1)]);
  const call = () => client.callTool({
    name: 'get_my_watcher_stats', arguments: { address: 'a' },
  });
  const missing = await call();
  assert.equal(missing.isError, true);
  assert.match(JSON.stringify(missing.content), /No matching watcher stats completion/);

  processor.run = async () => {
    await events.sendEventWithData(EventType.PermitsChanged, [permit('a', 1)]);
    await events.sendEventWithData(EventType.MyWatcherStatsRequestFinished, ['b']);
  };
  assert.match(JSON.stringify((await call()).content), /No matching watcher stats completion/);

  processor.run = async () => {
    await events.sendEventWithData(EventType.MyWatcherStatsRequestFinished, ['a']);
  };
  assert.match(JSON.stringify((await call()).content), /No valid permit snapshot/);

  processor.run = async () => {
    await events.sendEventWithData(EventType.PermitsChanged, [permit('a', 1)]);
    throw new Error('download failed');
  };
  const failed = await call();
  assert.equal(failed.isError, true);
  assert.match(JSON.stringify(failed.content), /download failed/);
});

test('serializes concurrent requests and uses each request’s own events', async (t) => {
  const { events, processor, client } = await setup(t);
  let releaseFirst: () => void = () => {};
  const gate = new Promise<void>((resolve) => { releaseFirst = resolve; });
  let firstStarted: () => void = () => {};
  const started = new Promise<void>((resolve) => { firstStarted = resolve; });
  processor.run = async (event) => {
    const { addresses } = event.data as { addresses: string[] };
    if (addresses[0] === 'a') {
      firstStarted();
      await gate;
    }
    await events.sendEventWithData(EventType.PermitsChanged, [permit(addresses[0], 1)]);
    await events.sendEventWithData(EventType.MyWatcherStatsRequestFinished, addresses);
  };
  const first = client.callTool({ name: 'get_my_watcher_stats', arguments: { address: 'a' } });
  await started;
  const second = client.callTool({ name: 'get_my_watcher_stats', arguments: { address: 'b' } });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(processor.events.length, 1);
  releaseFirst();
  assert.deepEqual((await first).structuredContent, { permits: [expectedPermit('a', 1)] });
  assert.deepEqual((await second).structuredContent, { permits: [expectedPermit('b', 1)] });
});

test('processor emits completion after the final snapshot in all refresh paths', async () => {
  for (const scenario of ['no permits', 'unchanged chains', 'changed chains'] as const) {
    const sent: EventPayload<unknown>[] = [];
    const sender = { sendEvent: async <T>(event: EventPayload<T>) => { sent.push(event); } };
    const storage = new MemoryStorageService();
    const processor = new ProcessEventService(sender, storage);
    const services = await createServices(sender, storage);
    processor.services = services;
    let reads = 0;
    const finalPermits = [permit('a', 1), permit('b', 2)];
    services.myWatcherDataService.getAdressPermits = async () => {
      reads++;
      if (reads === 1 && scenario === 'no permits') return [];
      if (reads <= 3 && scenario === 'changed chains') {
        return [{ ...permit('a', 1), chainType: ChainType.Cardano }];
      }
      return finalPermits;
    };
    const downloadedChains: ChainType[] = [];
    services.permitsDataService.downloadOpenBoxes = async (chain) => { downloadedChains.push(chain); };
    processor.downloadForChainPermitAddresses = async () => {};
    processor.downloadForActivePermitAddresses = async () => {};
    await processor.processEvent({
      type: EventType.MyWatcherStatsRequested,
      data: { addresses: ['a', 'b'] },
    }, { throwOnError: true });
    assert.deepEqual(sent.at(-1), {
      type: EventType.MyWatcherStatsRequestFinished, data: ['a', 'b'],
    });
    assert.equal(sent.at(-2)?.type, EventType.PermitsChanged);
    assert.deepEqual(sent.at(-2)?.data, finalPermits);
    assert.deepEqual(downloadedChains, scenario === 'changed chains'
      ? [ChainType.Cardano, ChainType.Ergo]
      : [ChainType.Ergo]);
  }
});

test('timed-out queued requests do not start later', async (t) => {
  const { processor, client } = await setup(t, 30);
  let releaseFirst: () => void = () => {};
  const gate = new Promise<void>((resolve) => { releaseFirst = resolve; });
  processor.run = async () => { await gate; };
  const call = (address: string) => client.callTool({
    name: 'get_my_watcher_stats', arguments: { address },
  });
  const first = call('a');
  const second = call('b');
  assert.equal((await first).isError, true);
  assert.equal((await second).isError, true);
  releaseFirst();
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(processor.events.length, 1);
});
