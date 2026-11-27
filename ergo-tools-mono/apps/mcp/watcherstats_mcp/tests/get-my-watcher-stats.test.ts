import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  EventService,
  EventType,
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
  address, wid: `wid-${address}`, chainType: 'Ergo',
  lockedRSN: 100, activeLockedRSN: 20,
  permitCount: count, activePermitCount: 1,
});

test('refreshes permits, returns the latest snapshot filtered by address, and validates input', async (t) => {
  const { events, processor, client } = await setup(t);
  processor.run = async () => {
    await events.sendEventWithData(EventType.PermitsChanged, [permit('a', 1)]);
    await events.sendEventWithData(EventType.PermitsChanged, [permit('a', 2), permit('b', 3)]);
  };
  const result = await client.callTool({
    name: 'get_my_watcher_stats', arguments: { address: 'a' },
  });
  assert.deepEqual(result.structuredContent, { permits: [permit('a', 2)] });
  assert.deepEqual(result.content, [{ type: 'text', text: JSON.stringify([permit('a', 2)]) }]);
  assert.deepEqual(processor.events, [{
    type: EventType.MyWatcherStatsRequested, data: { addresses: ['a'] },
  }]);

  assert.deepEqual((await client.callTool({
    name: 'get_my_watcher_stats', arguments: { address: 'b' },
  })).structuredContent, { permits: [permit('b', 3)] });

  processor.run = async () => {
    await events.sendEventWithData(EventType.PermitsChanged, []);
  };
  assert.deepEqual((await client.callTool({
    name: 'get_my_watcher_stats', arguments: { address: 'a' },
  })).structuredContent, { permits: [] });
  for (const input of [{ address: '' }, { address: '  ' }, { addresses: ['a'] }]) {
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
  assert.match(JSON.stringify(missing.content), /No valid permit snapshot/);

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
  };
  const first = client.callTool({ name: 'get_my_watcher_stats', arguments: { address: 'a' } });
  await started;
  const second = client.callTool({ name: 'get_my_watcher_stats', arguments: { address: 'b' } });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(processor.events.length, 1);
  releaseFirst();
  assert.deepEqual((await first).structuredContent, { permits: [permit('a', 1)] });
  assert.deepEqual((await second).structuredContent, { permits: [permit('b', 1)] });
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
