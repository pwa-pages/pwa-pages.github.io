import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  EventService,
  EventType,
  MemoryStorageService,
  permitTriggerAddresses,
  ProcessEventService,
  ServiceProfile,
  type EventPayload,
} from '@ergo-tools/service';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/server';
import { GetWatcherPerformanceTool } from '../src/get-watcher-performance.tool.js';

class TestProcessor extends ProcessEventService {
  events: EventPayload<object>[] = [];
  run: (event: EventPayload<object>) => Promise<void> = async () => {};

  constructor() {
    super({ sendEvent: async () => {} }, new MemoryStorageService(), ServiceProfile.MCP);
  }

  override async processEvent(event: EventPayload<object>): Promise<void> {
    this.events.push(event);
    await this.run(event);
  }
}

async function setup(
  t: import('node:test').TestContext,
  timeoutMs = 1000,
) {
  const events = new EventService();
  const processor = new TestProcessor();
  const server = new McpServer({ name: 'test', version: '1.0.0' });
  new GetWatcherPerformanceTool(events, processor, timeoutMs).register(server);
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

test('requests and returns monthly performance after matching reports complete', async (t) => {
  const { events, processor, client } = await setup(t);
  const stats = {
    watcherPerformances: {
      Ergo: {
        November: [{
          address: { address: 'watcher-1', chainType: 'Ergo' },
          reports: 12,
        }],
      },
      Cardano: {
        November: [{
          address: { address: 'watcher-2', chainType: 'Cardano' },
          reports: 4,
        }],
      },
    },
  };
  const ergoTriggerAddress = permitTriggerAddresses.Ergo;
  if (!ergoTriggerAddress) {
    throw new Error('Ergo report trigger address is not configured');
  }
  processor.run = async (event) => {
    assert.deepEqual(event, {
      type: EventType.ReportsRequested,
      data: 'Ergo',
    });
    await events.sendEventWithData(EventType.ReportsChanged, stats);
    await events.sendEventWithData(EventType.ALLReportsDataAvailable, 'other-address');
    await events.sendEventWithData(
      EventType.ALLReportsDataAvailable,
      ergoTriggerAddress,
    );
  };

  const result = await client.callTool({
    name: 'get_watcher_performance',
    arguments: { chainType: 'Ergo' },
  });
  const expected = {
    watcherPerformances: { Ergo: stats.watcherPerformances.Ergo },
  };
  assert.deepEqual(result.structuredContent, expected);
  assert.deepEqual(result.content, [{
    type: 'text',
    text: JSON.stringify(expected),
  }]);
  assert.deepEqual(processor.events, [{
    type: EventType.ReportsRequested,
    data: 'Ergo',
  }]);
});

test('reports unsupported chains, missing completion events, and processing failures', async (t) => {
  const { processor, client } = await setup(t, 30);
  const call = (chainType: string) => client.callTool({
    name: 'get_watcher_performance',
    arguments: { chainType },
  });

  const unsupported = await call('unsupported');
  assert.equal(unsupported.isError, true);
  assert.match(JSON.stringify(unsupported.content), /not available for chain type/);
  assert.equal(processor.events.length, 0);

  const timedOut = await call('Ergo');
  assert.equal(timedOut.isError, true);
  assert.match(JSON.stringify(timedOut.content), /timed out/);

  processor.run = async () => {
    throw new Error('report download failed');
  };
  const failed = await call('Ergo');
  assert.equal(failed.isError, true);
  assert.match(JSON.stringify(failed.content), /report download failed/);
});

test('returns an empty result when the requested chain has no cached reports', async (t) => {
  const { events, processor, client } = await setup(t);
  const ergoTriggerAddress = permitTriggerAddresses.Ergo;
  if (!ergoTriggerAddress) {
    throw new Error('Ergo report trigger address is not configured');
  }
  processor.run = async () => {
    await events.sendEventWithData(EventType.ReportsChanged, {
      watcherPerformances: {},
    });
    await events.sendEventWithData(
      EventType.ALLReportsDataAvailable,
      ergoTriggerAddress,
    );
  };

  const result = await client.callTool({
    name: 'get_watcher_performance',
    arguments: { chainType: 'Ergo' },
  });
  assert.deepEqual(result.structuredContent, {
    watcherPerformances: { Ergo: {} },
  });
});
