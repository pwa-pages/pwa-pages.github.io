/// <reference types="node" />
import { strict as assert } from 'node:assert';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { FileStorageService } from '../src/file.storage.service.js';

const directories: string[] = [];
const storages: FileStorageService[] = [];
function storageFor(directory: string): FileStorageService {
  const storage = new FileStorageService(directory);
  storages.push(storage);
  return storage;
}
async function fixture(): Promise<{
  dir: string;
  storage: FileStorageService;
}> {
  const dir = await mkdtemp(join(tmpdir(), 'sqlite-storage-test-'));
  directories.push(dir);
  return { dir, storage: storageFor(dir) };
}
afterEach(async () => {
  for (const storage of storages.splice(0)) storage.close();
  for (const dir of directories.splice(0))
    await rm(dir, { recursive: true, force: true });
});
function worker(...args: string[]): ChildProcess {
  const script = fileURLToPath(new URL('./storage-worker.ts', import.meta.url));
  return spawn(process.execPath, ['--import', 'tsx', script, ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
function finished(child: ChildProcess): Promise<void> {
  let errors = '';
  child.stderr?.on('data', (chunk) => (errors += String(chunk)));
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) =>
      code === 0
        ? resolve()
        : reject(new Error(`Worker exited ${code ?? signal}: ${errors}`)),
    );
  });
}

test('CRUD, upserts, explicit keys, empty batches, and persistence', async () => {
  const { dir, storage } = await fixture();
  await storage.addData('items', [
    { id: 'a', n: 1 },
    { id: 'b', n: 2 },
    { id: 'a', n: 3 },
  ]);
  assert.deepEqual(await storageFor(dir).getData('items'), [
    { id: 'a', n: 3 },
    { id: 'b', n: 2 },
  ]);
  assert.deepEqual(await storage.getData('items', 'a'), [{ id: 'a', n: 3 }]);
  assert.equal(await storage.getDataById('items', 'missing'), null);
  await storage.addData('items', [{ n: 1 }, { n: 2 }], 'same');
  assert.deepEqual(await storage.getDataById('items', 'same'), { n: 2 });
  await storage.addData('empty', []);
  await storage.addData('empty', [], new Date(NaN));
  await storage.deleteData('items', ['a', 'missing']);
  assert.equal(await storage.getDataById('items', 'a'), null);

  const database = await readFile(join(dir, 'watcherstats-mcp.sqlite'));
  assert.equal(database.subarray(0, 15).toString(), 'SQLite format 3');
});

test('records without IDs in unknown stores receive UUID keys', async () => {
  const { dir, storage } = await fixture();
  await storage.addData('uuid-fallback', [{ value: 1 }, { value: 2 }]);

  const database = new Database(join(dir, 'watcherstats-mcp.sqlite'));
  let keys: string[];
  try {
    keys = (
      database
        .prepare('SELECT key FROM storage_entries WHERE store_name = ?')
        .all('uuid-fallback') as { key: string }[]
    ).map(({ key }) => key);
  } finally {
    database.close();
  }
  assert.equal(keys.length, 2);
  assert.ok(
    keys.every((key) =>
      /^string:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        key,
      ),
    ),
  );
  storage.close();
  await assert.rejects(storage.getData('uuid-fallback'), /closed/);
});

test('known stores use their IndexedDB key paths and reject missing or invalid IDs', async () => {
  const { storage } = await fixture();
  await storage.addData('inputBoxes', [
    { boxId: 'b', outputAddress: 'a', n: 1 },
  ]);
  await storage.addData('inputBoxes', [
    { boxId: 'b', outputAddress: 'a', n: 2 },
  ]);
  assert.deepEqual(await storage.getDataById('inputBoxes', ['b', 'a']), {
    boxId: 'b',
    outputAddress: 'a',
    n: 2,
  });
  await storage.deleteData('inputBoxes', [['b', 'a']]);
  assert.deepEqual(await storage.getData('inputBoxes'), []);
  await storage.addData(
    'inputBoxes',
    [{ boxId: 'inline', outputAddress: 'key', n: 3 }],
    'ignored explicit key',
  );
  assert.deepEqual(await storage.getDataById('inputBoxes', ['inline', 'key']), {
    boxId: 'inline',
    outputAddress: 'key',
    n: 3,
  });
  await storage.addData(
    'inputBoxes',
    [{ boxId: 'inline-invalid', outputAddress: 'key', n: 4 }],
    new Date(NaN),
  );
  assert.deepEqual(
    await storage.getDataById('inputBoxes', ['inline-invalid', 'key']),
    { boxId: 'inline-invalid', outputAddress: 'key', n: 4 },
  );

  await storage.addData('openBoxesStore', [{ address: 'a', data: 1 }]);
  assert.deepEqual(await storage.getDataById('openBoxesStore', 'a'), {
    address: 'a',
    data: 1,
  });
  await storage.addData('downloads', [{ data: 1 }, { data: 2 }], 'url');
  assert.deepEqual(await storage.getDataById('downloads', 'url'), { data: 2 });
  await assert.rejects(
    storage.addData('downloads', [{ data: 3 }], new Date(NaN)),
    /Invalid IndexedDB/,
  );
  await storage.addData('downloads', [], new Date(NaN));
  await assert.rejects(
    storage.addData('watcherReports', [{ id: 'not-an-inline-key' }]),
    /Missing explicit key/,
  );
  await assert.rejects(
    storage.addData('inputBoxes', [{ boxId: 'b' }]),
    /Missing key/,
  );
  await assert.rejects(
    storage.addData('perfTxs', [{ id: NaN }]),
    /Invalid IndexedDB/,
  );
  await assert.rejects(
    storage.addData('perfTxs', [{ id: 'good' }, { id: NaN }]),
    /Invalid IndexedDB/,
  );
  assert.deepEqual(await storage.getData('perfTxs'), []);
});

test('key types are distinct and binary views use only their visible bytes', async () => {
  const { storage } = await fixture();
  const pairs: [IDBValidKey, string][] = [
    ['1', 'string'],
    [1, 'number'],
    [0, 'zero'],
    [new Date(5), 'date'],
    [['a', 1, ['b']], 'array'],
    [new Uint8Array([9, 2, 3, 9]).subarray(1, 3), 'binary'],
  ];
  for (const [key, value] of pairs) await storage.addData('keys', [value], key);
  for (const [key, value] of pairs)
    assert.equal(await storage.getDataById('keys', key), value);
  assert.equal(
    await storage.getDataById('keys', new Uint8Array([2, 3]).buffer),
    'binary',
  );
  await storage.addData('keys', ['negative zero'], -0);
  assert.equal(await storage.getDataById('keys', 0), 'negative zero');
  await assert.rejects(
    storage.getDataById('keys', new Date(NaN)),
    /Invalid IndexedDB/,
  );
  for (const key of [NaN, Infinity, -Infinity]) {
    await assert.rejects(storage.getDataById('keys', key), /Invalid IndexedDB/);
  }
  const cyclic: IDBValidKey[] = [];
  cyclic.push(cyclic);
  await assert.rejects(storage.getDataById('keys', cyclic), /cyclic/);
  const sparse: IDBValidKey[] = Array(1);
  await assert.rejects(
    storage.getDataById('keys', sparse),
    /Invalid IndexedDB/,
  );
});

test('string keys preserve distinct UTF-16 code units', async () => {
  const { storage } = await fixture();
  const loneSurrogate = '\ud800';
  const replacementCharacter = '\ufffd';

  await storage.addData('unicode-keys', ['surrogate'], loneSurrogate);
  await storage.addData(
    'unicode-keys',
    ['replacement'],
    replacementCharacter,
  );

  assert.equal(
    await storage.getDataById('unicode-keys', loneSurrogate),
    'surrogate',
  );
  assert.equal(
    await storage.getDataById('unicode-keys', replacementCharacter),
    'replacement',
  );
});

test('reads legacy SQLite entries with date markers and reports malformed rows', async () => {
  const { dir, storage } = await fixture();
  await storage.getData('legacy');

  const database = new Database(join(dir, 'watcherstats-mcp.sqlite'));
  try {
    database
      .prepare(
        'INSERT INTO storage_entries (store_name, key, value) VALUES (?, ?, ?)',
      )
      .run(
        'legacy',
        'string:legacy',
        JSON.stringify({
          key: 'string:legacy',
          value: {
            id: 'legacy',
            date: { __ergo_tools_storage_date__: 123 },
            invalidDate: { __ergo_tools_storage_date__: null },
          },
        }),
      );
    database
      .prepare(
        'INSERT INTO storage_entries (store_name, key, value) VALUES (?, ?, ?)',
      )
      .run('legacy', 'string:broken', '{');
    database
      .prepare(
        'INSERT INTO storage_entries (store_name, key, value) VALUES (?, ?, ?)',
      )
      .run(
        'legacy',
        'string:previous-sqlite-format',
        JSON.stringify({
          key: 'string:previous-sqlite-format',
          value: { id: 'previous-format', date: null },
          dates: [],
        }),
      );
  } finally {
    database.close();
  }

  assert.deepEqual(
    await storage.getDataById('legacy', 'previous-sqlite-format'),
    { id: 'previous-format', date: null },
  );
  const legacy = await storage.getDataById<{
    date: Date;
    invalidDate: Date;
  }>('legacy', 'legacy');
  assert.equal(legacy?.date.getTime(), 123);
  assert.ok(Number.isNaN(legacy?.invalidDate.getTime()));
  await assert.rejects(
    storage.getDataById('legacy', 'broken'),
    /Failed to decode storage entry from "legacy" for key/,
  );
  assert.equal(
    (
      await storage.getDataById<{ date: Date }>('legacy', 'legacy')
    )?.date.getTime(),
    123,
  );
});

test('dates and ordinary marker-shaped objects survive nested and root values', async () => {
  const { storage } = await fixture();
  const marker = { __ergo_tools_storage_date__: 123 };
  await storage.addData('dates', [
    {
      id: 'a',
      marker,
      nested: [new Date(123), { d: new Date(NaN) }],
      '': new Date(7),
    },
  ]);
  const result = await storage.getDataById<{
    marker: unknown;
    nested: [Date, { d: Date }];
    '': Date;
  }>('dates', 'a');
  assert.deepEqual(result?.marker, marker);
  assert.equal(result?.nested[0].getTime(), 123);
  assert.ok(Number.isNaN(result?.nested[1].d.getTime()));
  assert.equal(result?.[''].getTime(), 7);
  await storage.addData('dates', [new Date(456)], 'root');
  assert.equal(
    (await storage.getDataById<Date>('dates', 'root'))?.getTime(),
    456,
  );
});

test('preserves explicit undefined values in stored records', async () => {
  const { storage } = await fixture();
  const value = {
    id: 'undefined-values',
    lastDownloadDate: undefined,
    nested: { missing: undefined },
    list: [undefined, null],
  };
  await storage.addData('undefined-values', [value]);

  const restored = await storage.getDataById<typeof value>(
    'undefined-values',
    'undefined-values',
  );
  assert.deepEqual(restored, value);
  assert.ok(restored && Object.hasOwn(restored, 'lastDownloadDate'));
  assert.ok(restored && Object.hasOwn(restored.nested, 'missing'));
});

test('preserves root and nested undefined values and empty property names', async () => {
  const { storage } = await fixture();
  const value = {
    '': undefined,
    nested: { '': undefined },
    list: [undefined, { '': undefined }],
  };
  await storage.addData('undefined-paths', [value], 'nested');
  await storage.addData('undefined-paths', [undefined], 'root');

  assert.deepEqual(await storage.getData('undefined-paths'), [
    {
      '': undefined,
      nested: { '': undefined },
      list: [undefined, { '': undefined }],
    },
    undefined,
  ]);
  assert.equal(await storage.getDataById('undefined-paths', 'root'), null);
  const restored = await storage.getDataById<typeof value>(
    'undefined-paths',
    'nested',
  );
  assert.ok(restored && Object.hasOwn(restored, ''));
  assert.ok(restored && Object.hasOwn(restored.nested, ''));
  assert.ok(
    restored && restored.list[1] && Object.hasOwn(restored.list[1], ''),
  );
});

test('serializes custom toJSON results without losing date and undefined metadata', async () => {
  const { storage } = await fixture();
  await storage.addData('custom-to-json', [
    {
      id: 'custom',
      serialized: {
        value: 'rendered',
        toJSON() {
          return { '': undefined, rendered: this.value, date: new Date(123) };
        },
      },
    },
  ]);

  assert.deepEqual(await storage.getDataById('custom-to-json', 'custom'), {
    id: 'custom',
    serialized: { '': undefined, rendered: 'rendered', date: new Date(123) },
  });
});

test('close during pending initialization rejects all waiting operations', async () => {
  const { storage } = await fixture();
  const pending = [
    storage.getData('pending-close'),
    storage.addData('pending-close', [{ id: 'write' }]),
  ];
  storage.close();
  await Promise.all(
    pending.map((operation) =>
      assert.rejects(operation, /Storage service is closed/),
    ),
  );
});

test('close after initialization prevents a waiting operation from using the connection', async () => {
  const { storage } = await fixture();
  await storage.getData('initialized');

  const pending = [
    storage.getData('closed-before-resume'),
    storage.addData('closed-before-resume', [{ id: 'write' }]),
  ];
  storage.close();
  await Promise.all(
    pending.map((operation) =>
      assert.rejects(operation, /Storage service is closed/),
    ),
  );
});

test('data survives closing and reopening the SQLite connection', async () => {
  const { dir, storage } = await fixture();
  await storage.addData('reopened', [{ id: 'persisted', value: 42 }]);
  storage.close();

  const reopened = storageFor(dir);
  assert.deepEqual(await reopened.getData('reopened'), [
    { id: 'persisted', value: 42 },
  ]);
});

test('a failed database initialization can be retried', async () => {
  const { dir } = await fixture();
  const blockedDirectory = join(dir, 'blocked');
  await writeFile(blockedDirectory, 'not a directory');
  const storage = storageFor(blockedDirectory);

  await assert.rejects(storage.getData('retry'), /EEXIST|ENOTDIR/);
  await rm(blockedDirectory);
  await storage.addData('retry', [{ id: 'recovered' }]);

  assert.deepEqual(await storage.getData('retry'), [{ id: 'recovered' }]);
});

test('rejects unserializable batches without writing any records', async () => {
  const { storage } = await fixture();
  await storage.addData('atomic', [{ id: 'existing', value: 'preserved' }]);
  const cyclic: { id: string; self?: unknown } = { id: 'invalid' };
  cyclic.self = cyclic;

  await assert.rejects(
    storage.addData('atomic', [{ id: 'new', value: 'must roll back' }, cyclic]),
  );
  assert.deepEqual(await storage.getData('atomic'), [
    { id: 'existing', value: 'preserved' },
  ]);
});

test('a failed SQLite write rolls back earlier upserts in the transaction', async () => {
  const { dir, storage } = await fixture();
  await storage.addData('atomic', [{ id: 'existing', value: 'preserved' }]);

  const database = new Database(join(dir, 'watcherstats-mcp.sqlite'));
  try {
    database.exec(`
      CREATE TRIGGER reject_atomic_entry
      BEFORE INSERT ON storage_entries
      WHEN NEW.store_name = 'atomic' AND NEW.key = 'string:reject'
      BEGIN
        SELECT RAISE(ABORT, 'test rejection');
      END
    `);
  } finally {
    database.close();
  }

  await assert.rejects(
    storage.addData('atomic', [
      { id: 'existing', value: 'changed' },
      { id: 'new', value: 'must roll back' },
      { id: 'reject', value: 'triggered failure' },
    ]),
    /test rejection/,
  );
  assert.deepEqual(await storage.getData('atomic'), [
    { id: 'existing', value: 'preserved' },
  ]);
});

test('store names do not collide, traverse paths, or use inherited keys', async () => {
  const { dir, storage } = await fixture();
  const names = [
    'foo',
    'Foo',
    '../foo',
    'con',
    'foo.',
    'toString',
    'a'.repeat(100),
  ];
  for (const name of names) await storage.addData(name, [{ name }], 'key');
  for (const name of names)
    assert.deepEqual(await storage.getDataById(name, 'key'), { name });
  await assert.rejects(storage.getData(''), /Store name/);
  await assert.rejects(storage.getData('\ud800'), /Store name/);

  const legacy = join(dir, 'foo.json');
  await writeFile(legacy, '[]');
  await storage.addData('foo', [{ name: 'still SQLite' }], 'another-key');
  assert.deepEqual(await storage.getData('foo'), [
    { name: 'foo' },
    { name: 'still SQLite' },
  ]);
  assert.equal(await readFile(legacy, 'utf8'), '[]');
});

test('concurrent operations in one process and across processes retain all records', async () => {
  const { dir, storage } = await fixture();
  await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      storageFor(dir).addData('concurrent', [{ id: `local-${i}` }]),
    ),
  );
  await Promise.all([
    ...Array.from({ length: 4 }, (_, i) =>
      finished(worker('write', dir, String(i))),
    ),
    ...Array.from({ length: 10 }, (_, i) =>
      storage.deleteData('concurrent', `local-${i}`),
    ),
    ...Array.from({ length: 5 }, () => storage.getData('concurrent')),
  ]);
  assert.equal((await storage.getData('concurrent')).length, 50);
});

test('concurrent reads, additions and deletes observe complete transactions', async () => {
  const { storage } = await fixture();
  await storage.addData(
    'mixed',
    Array.from({ length: 10 }, (_, i) => ({ id: `old-${i}` })),
  );
  const operations = Array.from({ length: 10 }, (_, i) => [
    storage.deleteData('mixed', `old-${i}`),
    storage.addData('mixed', [{ id: `new-${i}` }]),
    storage.getData<{ id: string }>('mixed').then((items) => {
      assert.equal(new Set(items.map((item) => item.id)).size, items.length);
    }),
  ]).flat();
  await Promise.all(operations);
  assert.deepEqual(
    (await storage.getData<{ id: string }>('mixed'))
      .map((item) => item.id)
      .sort(),
    Array.from({ length: 10 }, (_, i) => `new-${i}`).sort(),
  );
});
