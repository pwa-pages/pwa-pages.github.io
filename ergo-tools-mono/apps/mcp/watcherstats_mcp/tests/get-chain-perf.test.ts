import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { EventService, EventType } from '@ergo-tools/service';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/server';
import { ChainPerfStatsTool } from '../src/get-chain-perf.tool.js';

test('chain performance filters UTC dates and returns ISO timestamps', async (t) => {
  const events = new EventService();
  const server = new McpServer({ name: 'test', version: '1.0.0' });
  new ChainPerfStatsTool(events).register(server);
  const client = new Client({ name: 'test', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });

  const call = (args: Record<string, string> = {}) =>
    client.callTool({ name: 'get_chain_perf', arguments: args });
  assert.equal((await call()).isError, true);

  const transactions = [
    { id: 'before', timestamp: String(Date.parse('2025-10-18T23:59:59.999Z')), amount: 1 },
    { id: 'start', timestamp: String(Date.parse('2025-10-19T00:00:00.000Z')), amount: 2, chainType: 'Ergo' },
    { id: 'end', timestamp: String(Date.parse('2025-10-19T23:59:59.999Z')), amount: 3, decimals: 3 },
    { id: 'after', timestamp: String(Date.parse('2025-10-20T00:00:00.000Z')), amount: 4 },
  ];
  await events.sendEventWithData(EventType.PerfTxsChanged, transactions);
  const expected = [
    { timestamp: '2025-10-18T23:59:59.999Z', amount: 1 },
    { timestamp: '2025-10-19T00:00:00.000Z', amount: 2, chainType: 'Ergo' },
    { timestamp: '2025-10-19T23:59:59.999Z', amount: 3, decimals: 3 },
    { timestamp: '2025-10-20T00:00:00.000Z', amount: 4 },
  ];
  const all = await call();
  assert.deepEqual(all.structuredContent, { transactions: expected });
  assert.deepEqual(all.content, [{ type: 'text', text: JSON.stringify(expected) }]);
  const selected = await call({ startDate: '2025-10-19', endDate: '2025-10-19' });
  assert.deepEqual(selected.structuredContent, { transactions: expected.slice(1, 3) });
  assert.deepEqual(selected.content, [{ type: 'text', text: JSON.stringify(expected.slice(1, 3)) }]);
  assert.deepEqual((await call({ startDate: '2025-10-20' })).structuredContent, {
    transactions: expected.slice(3),
  });
  assert.deepEqual((await call({ endDate: '2025-10-18' })).structuredContent, {
    transactions: expected.slice(0, 1),
  });
  assert.equal((await call({ startDate: '2025-10-20', endDate: '2025-10-19' })).isError, true);
  assert.equal((await call({ startDate: '2025-02-30' })).isError, true);

  await events.sendEventWithData(EventType.PerfTxsChanged, [
    { id: 'invalid', timestamp: 'not a date', amount: 0 },
  ]);
  const invalid = await call();
  assert.equal(invalid.isError, true);
  assert.match(JSON.stringify(invalid.content), /invalid timestamp/);

  await events.sendEventWithData(EventType.PerfTxsChanged, [
    { id: 'invalid', timestamp: null, amount: 0 },
  ]);
  assert.equal((await call()).isError, true);

  await events.sendEventWithData(EventType.PerfTxsChanged, []);
  assert.deepEqual((await call()).structuredContent, { transactions: [] });
});
