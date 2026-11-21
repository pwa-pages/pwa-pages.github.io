/// <reference types="node" />
import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { spawn, type ChildProcess } from 'node:child_process';
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { afterEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { FileStorageService } from '../src/file.storage.service.js';

const directories: string[] = [];
async function fixture(): Promise<{
  dir: string;
  storage: FileStorageService;
}> {
  const dir = await mkdtemp(join(tmpdir(), 'file-storage-test-'));
  await mkdir(join(dir, 'stores-v2'));
  directories.push(dir);
  return { dir, storage: new FileStorageService(dir) };
}
afterEach(async () => {
  for (const dir of directories.splice(0))
    await rm(dir, { recursive: true, force: true });
});
function canonical(dir: string, store: string): string {
  return join(
    dir,
    'stores-v2',
    `store-${createHash('sha256').update(store).digest('hex')}.json`,
  );
}
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
  assert.deepEqual(await new FileStorageService(dir).getData('items'), [
    { id: 'a', n: 3 },
    { id: 'b', n: 2 },
  ]);
  assert.deepEqual(await storage.getData('items', 'a'), [{ id: 'a', n: 3 }]);
  assert.equal(await storage.getDataById('items', 'missing'), null);
  await storage.addData('items', [{ n: 1 }, { n: 2 }], 'same');
  assert.deepEqual(await storage.getDataById('items', 'same'), { n: 2 });
  await storage.addData('empty', []);
  await storage.deleteData('items', ['a', 'missing']);
  assert.equal(await storage.getDataById('items', 'a'), null);
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
  await storage.addData('openBoxesStore', [{ address: 'a', data: 1 }]);
  assert.deepEqual(await storage.getDataById('openBoxesStore', 'a'), {
    address: 'a',
    data: 1,
  });
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
    [Infinity, 'infinity'],
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
  await assert.rejects(
    storage.getDataById('keys', new Date(NaN)),
    /Invalid IndexedDB/,
  );
  await assert.rejects(storage.getDataById('keys', NaN), /Invalid IndexedDB/);
  const cyclic: IDBValidKey[] = [];
  cyclic.push(cyclic);
  await assert.rejects(storage.getDataById('keys', cyclic), /cyclic/);
  const sparse: IDBValidKey[] = Array(1);
  await assert.rejects(
    storage.getDataById('keys', sparse),
    /Invalid IndexedDB/,
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

test('corrupt data and serialization failures never replace the committed file', async () => {
  const { dir, storage } = await fixture();
  await storage.addData('bad', [{ id: 'a' }]);
  const path = canonical(dir, 'bad');
  const before = await readFile(path, 'utf8');
  const cyclic: { id: string; self?: unknown } = { id: 'cycle' };
  cyclic.self = cyclic;
  await assert.rejects(storage.addData('bad', [cyclic]));
  assert.equal(await readFile(path, 'utf8'), before);
  assert.equal(
    (await readdir(join(dir, 'stores-v2'))).filter((name) =>
      name.endsWith('.tmp'),
    ).length,
    0,
  );
  for (const contents of [
    '{',
    '{}',
    '[{"key":"x"}]',
    '[{"key":"x","value":null,"dates":[{"path":["x"],"time":0}]}]',
    '[{"key":"x","value":1},{"key":"x","value":2}]',
  ]) {
    await writeFile(path, contents);
    await assert.rejects(storage.getData('bad'), /Invalid storage file/);
    await assert.rejects(
      storage.addData('bad', [{ id: 'b' }]),
      /Invalid storage file/,
    );
    assert.equal(await readFile(path, 'utf8'), contents);
  }
  await writeFile(path, before);
  await storage.addData('bad', [{ id: 'recovered' }]);
  assert.deepEqual(await storage.getDataById('bad', 'recovered'), {
    id: 'recovered',
  });
});

test('legacy files require migration and old date markers are restored afterward', async () => {
  const { dir, storage } = await fixture();
  const legacy = join(dir, 'downloads.json');
  await writeFile(
    legacy,
    JSON.stringify([
      {
        key: 'string:old',
        value: { date: { __ergo_tools_storage_date__: 42 } },
      },
    ]),
  );
  await assert.rejects(storage.getData('downloads'), /manual migration/);
  await copyFile(legacy, canonical(dir, 'downloads'));
  assert.equal(
    (
      await storage.getDataById<{ date: Date }>('downloads', 'old')
    )?.date.getTime(),
    42,
  );
  await storage.addData('downloads', [{ new: true }], 'new');
  assert.ok(await readFile(legacy, 'utf8'));
  assert.equal((await storage.getData('downloads')).length, 2);
  await writeFile(join(dir, 'custom.json'), '[]');
  await assert.rejects(storage.getData('custom'), /manual migration/);
});

test('names do not collide, traverse paths, or use inherited keys', async () => {
  const { dir, storage } = await fixture();
  const names = [
    'foo',
    'Foo',
    `foo-${createHash('sha256').update('Foo').digest('hex').slice(0, 8)}`,
    `store-${createHash('sha256').update('foo').digest('hex')}`,
    '../foo',
    'con',
    'foo.',
    'toString',
    'a'.repeat(100),
  ];
  for (const name of names) await storage.addData(name, [{ name }], 'key');
  for (const name of names)
    assert.deepEqual(await storage.getDataById(name, 'key'), { name });
  assert.equal(
    (await readdir(join(dir, 'stores-v2'))).filter((name) =>
      name.endsWith('.json'),
    ).length,
    names.length,
  );
  await assert.rejects(storage.getData(''), /Store name/);
  await assert.rejects(storage.getData('\ud800'), /Store name/);
});

test(
  'dangling storage symlinks are reported rather than replaced',
  { skip: process.platform === 'win32' },
  async () => {
    const { dir, storage } = await fixture();
    const path = canonical(dir, 'dangling');
    await symlink(join(dir, 'missing-target'), path);
    await assert.rejects(
      storage.addData('dangling', [{ id: 'x' }]),
      /exists but cannot be read/,
    );
    await rm(path);
    await symlink(join(dir, 'missing-target'), join(dir, 'dangling.json'));
    await assert.rejects(storage.getData('dangling'), /manual migration/);
  },
);

test('concurrent operations in one process and across processes retain all records', async () => {
  const { dir, storage } = await fixture();
  await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      new FileStorageService(dir).addData('concurrent', [{ id: `local-${i}` }]),
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

test('killing a writer during a temporary write preserves a complete committed file', async () => {
  const { dir, storage } = await fixture();
  await storage.addData('interrupted', [{ id: 'original' }]);
  const child = worker('large-write', dir);
  let exited = false;
  child.once('exit', () => {
    exited = true;
  });
  try {
    const deadline = Date.now() + 10_000;
    let sawTemp = false;
    while (!exited && Date.now() < deadline) {
      if (
        (await readdir(join(dir, 'stores-v2'))).some((name) =>
          name.endsWith('.tmp'),
        )
      ) {
        sawTemp = true;
        child.kill();
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 2));
    }
    assert.ok(
      sawTemp,
      'writer must be interrupted while a temporary file exists',
    );
    await new Promise<void>((resolve) => {
      if (exited) resolve();
      else child.once('exit', () => resolve());
    });
    const result = await storage.getData<{ id: string }>('interrupted');
    assert.ok(result.length === 1 || result.length === 2);
    assert.equal(result[0].id, 'original');
    if (result.length === 2) assert.equal(result[1].id, 'large');
    assert.equal(
      (await readdir(join(dir, 'stores-v2'))).filter((name) =>
        name.endsWith('.tmp'),
      ).length,
      0,
    );
  } finally {
    child.kill();
  }
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

test('a crashed lock holder is released by the OS and interrupted temporary files are cleaned', async () => {
  const { dir, storage } = await fixture();
  const path = canonical(dir, 'concurrent');
  const temp = `${path}.12345678-1234-4123-8123-123456789abc.tmp`;
  await writeFile(temp, 'partial');
  const child = worker('hold', dir);
  await new Promise<void>((resolve, reject) => {
    child.once('error', reject);
    child.stdout?.once('data', () => resolve());
    child.once('exit', (code) =>
      reject(new Error(`Lock holder exited ${code}`)),
    );
  });
  try {
    let completed = false;
    const operation = storage
      .addData('concurrent', [{ id: 'after-crash' }])
      .then(() => {
        completed = true;
      });
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(completed, false);
    child.kill();
    await operation;
  } finally {
    child.kill();
  }
  assert.deepEqual(await storage.getDataById('concurrent', 'after-crash'), {
    id: 'after-crash',
  });
  assert.ok(!(await readdir(join(dir, 'stores-v2'))).includes(basename(temp)));
});

test('abandoned legacy locks are tolerated and live or invalid locks are reported', async () => {
  const { dir, storage } = await fixture();
  const lock = join(dir, 'downloads.json.lock');
  await writeFile(lock, '2147483647');
  await writeFile(`${lock}.recovery`, '2147483647');
  assert.deepEqual(await storage.getData('downloads'), []);
  await writeFile(lock, String(process.pid));
  await assert.rejects(storage.getData('downloads'), /held by process/);
  await writeFile(lock, 'invalid');
  await assert.rejects(storage.getData('downloads'), /Cannot determine owner/);
});
