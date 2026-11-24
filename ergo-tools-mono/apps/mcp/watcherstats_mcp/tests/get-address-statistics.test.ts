import { strict as assert } from 'node:assert';
import { setImmediate as nextImmediate } from 'node:timers/promises';
import { test } from 'node:test';
import {
  EventService,
  EventType,
  Input,
  MemoryStorageService,
  ProcessEventService,
  type EventPayload,
} from '@ergo-tools/service';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/server';
import { GetAddressStatisticsTool } from '../src/get-address-performance.tool.js';

class TestProcessEventService extends ProcessEventService {
  events: EventPayload<object>[] = [];

  constructor() {
    super({ sendEvent: async () => {} }, new MemoryStorageService());
  }

  override async processEvent(event: EventPayload<object>): Promise<void> {
    this.events.push(event);
  }
}

test('address statistics returns normalized amounts and dates as text and structured content', async (t) => {
  const events = new EventService();
  const processor = new TestProcessEventService();
  const server = new McpServer({ name: 'test', version: '1.0.0' });
  const tool = new GetAddressStatisticsTool(events, processor);
  tool.register(server);
  const client = new Client({ name: 'test', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });

  const request = { name: 'get_address_statistics', arguments: { address: 'watcher' } };
  const unavailable = await client.callTool(request);
  assert.equal(unavailable.isError, true);

  const input = new Input(
    new Date('2025-10-19T22:00:50.657Z'),
    '',
    0,
    [{ tokenId: 'token', amount: 4252, name: 'eRSN', decimals: 3, type: 'EIP-004' }],
    'watcher',
    'box',
    4252,
    4.252,
  );
  const secondInput = new Input(
    new Date('2025-10-20T00:00:00.000Z'),
    '',
    0,
    [{ tokenId: 'token', amount: 1, name: 'eRSN', decimals: 6, type: 'EIP-004' }],
    'another-watcher',
    'other-box',
    4253,
    0.000001,
  );
  await events.sendEventWithData(EventType.InputsChanged, [input, secondInput]);
  assert.equal(tool.isReady('watcher'), false);
  await events.sendEventWithData(EventType.EndFullDownload, 'another-watcher');
  assert.equal(tool.isReady('another-watcher'), true);
  assert.equal(tool.isReady('watcher'), false);
  await events.sendEventWithData(EventType.EndFullDownload, 'watcher');
  assert.equal(tool.isReady('watcher'), true);

  const result = await client.callTool(request);
  const expected = [
    { inputDate: '2025-10-19T22:00:50.657Z', amount: 4.252 },
  ];
  assert.deepEqual(result.structuredContent, { rewards: expected });
  assert.deepEqual(result.content, [{ type: 'text', text: JSON.stringify(expected) }]);
  assert.notEqual(result.isError, true);

  const dateRange = await client.callTool({
    name: 'get_address_statistics',
    arguments: { address: 'watcher', startDate: '2025-10-19', endDate: '2025-10-19' },
  });
  assert.deepEqual(dateRange.structuredContent, { rewards: [expected[0]] });

  const startOnly = await client.callTool({
    name: 'get_address_statistics',
    arguments: { address: 'watcher', startDate: '2025-10-20' },
  });
  assert.deepEqual(startOnly.structuredContent, { rewards: [] });

  const endOnly = await client.callTool({
    name: 'get_address_statistics',
    arguments: { address: 'watcher', endDate: '2025-10-19' },
  });
  assert.deepEqual(endOnly.structuredContent, { rewards: [expected[0]] });

  const invalidRange = await client.callTool({
    name: 'get_address_statistics',
    arguments: { address: 'watcher', startDate: '2025-10-21', endDate: '2025-10-19' },
  });
  assert.equal(invalidRange.isError, true);
  assert.match(JSON.stringify(invalidRange.content), /Start date must be on or before end date/);

  input.amount = undefined;
  await events.sendEventWithData(EventType.InputsChanged, [input]);
  const invalidAmount = await client.callTool(request);
  assert.equal(invalidAmount.isError, true);
  assert.match(JSON.stringify(invalidAmount.content), /invalid amount/);

  input.amount = 0;
  input.inputDate = new Date('invalid');
  await events.sendEventWithData(EventType.InputsChanged, [input]);
  const invalidDate = await client.callTool(request);
  assert.equal(invalidDate.isError, true);
  assert.match(JSON.stringify(invalidDate.content), /invalid input date/);

  input.inputDate = new Date('2025-10-19T22:00:50.657Z');
  await events.sendEventWithData(EventType.InputsChanged, [input]);
  const zero = await client.callTool(request);
  assert.deepEqual(zero.structuredContent, {
    rewards: [{ inputDate: '2025-10-19T22:00:50.657Z', amount: 0 }],
  });

  await events.sendEventWithData(EventType.InputsChanged, []);
  const empty = await client.callTool(request);
  assert.deepEqual(empty.structuredContent, { rewards: [] });
  assert.deepEqual(empty.content, [{ type: 'text', text: '[]' }]);

  await nextImmediate();
  assert.equal(processor.events.length, 9);
  for (const event of processor.events) {
    assert.equal(event.type, EventType.RequestInputsDownload);
    assert.equal(event.data, 'watcher');
  }
});
