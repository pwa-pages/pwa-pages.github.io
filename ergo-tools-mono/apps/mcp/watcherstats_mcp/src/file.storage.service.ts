import { createHash, randomUUID } from 'node:crypto';
import { createServer, Server } from 'node:net';
import {
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
} from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import type { IStorageService } from '@ergo-tools/service';
import envPaths from 'env-paths';

interface StoredEntry {
  key: string;
  value: unknown;
}

interface DatePath {
  path: string[];
  time: number | null;
}

const dateMarker = '__ergo_tools_storage_date__';
const knownKeyPaths = new Map<string, string[]>([
  ['inputBoxes', ['boxId', 'outputAddress']],
  ['perfTxs', ['id']],
  ['permitTxs', ['id']],
  ['activePermitTxs', ['id']],
  ['reportsStore', ['id']],
  ['downloadStatusStore', ['address']],
  ['openBoxesStore', ['address']],
  ['addressData', ['address']],
]);
function errorCode(error: unknown): string | undefined {
  return error instanceof Error &&
    'code' in error &&
    typeof error.code === 'string'
    ? error.code
    : undefined;
}

function legacyFilename(name: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/^\.+/, '_')
    .slice(0, 64);
  const reserved = /^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/.test(sanitized);
  const base =
    sanitized === name && !reserved
      ? sanitized
      : `${sanitized}-${createHash('sha256').update(name).digest('hex').slice(0, 8)}`;
  return `${base}.json`;
}

function serializeKey(key: unknown, ancestors = new Set<unknown>()): string {
  if (typeof key === 'string') return `string:${key}`;
  if (typeof key === 'number' && !Number.isNaN(key))
    return `number:${key === 0 ? 0 : key}`;
  if (key instanceof Date && Number.isFinite(key.getTime()))
    return `date:${key.getTime()}`;
  if (key instanceof ArrayBuffer)
    return `binary:${Buffer.from(key).toString('base64')}`;
  if (ArrayBuffer.isView(key)) {
    return `binary:${Buffer.from(key.buffer, key.byteOffset, key.byteLength).toString('base64')}`;
  }
  if (Array.isArray(key)) {
    if (ancestors.has(key))
      throw new TypeError('Storage keys cannot be cyclic');
    ancestors.add(key);
    try {
      return `array:${JSON.stringify(Array.from(key, (part) => serializeKey(part, ancestors)))}`;
    } finally {
      ancestors.delete(key);
    }
  }
  throw new TypeError('Invalid IndexedDB storage key');
}

function itemKey(store: string, item: unknown): unknown {
  const fields = knownKeyPaths.get(store);
  if (fields) {
    if (item === null || typeof item !== 'object') {
      throw new TypeError(`Missing key for store ${store}`);
    }
    const values = fields.map((field) => Reflect.get(item, field));
    if (values.some((value) => value === undefined)) {
      throw new TypeError(`Missing key for store ${store}`);
    }
    return values.length === 1 ? values[0] : values;
  }
  if (item !== null && typeof item === 'object' && 'id' in item) {
    return Reflect.get(item, 'id');
  }
  return randomUUID();
}

function encodeEntry(entry: StoredEntry): object {
  const dates: DatePath[] = [];
  const paths = new WeakMap<object, string[]>();
  const json = JSON.stringify(
    entry.value,
    function (this: Record<string, unknown>, key, value: unknown) {
      const parentPath = paths.get(this) ?? [];
      const path = key === '' && !paths.has(this) ? [] : [...parentPath, key];
      const original = this[key];
      if (original instanceof Date) {
        const time = original.getTime();
        dates.push({ path, time: Number.isFinite(time) ? time : null });
        return null;
      }
      if (value !== null && typeof value === 'object') paths.set(value, path);
      return value;
    },
  );
  if (json === undefined)
    throw new TypeError('Storage value cannot be serialized');
  return { key: entry.key, value: JSON.parse(json), dates };
}

function decodeEntry(raw: unknown): StoredEntry {
  if (
    raw === null ||
    typeof raw !== 'object' ||
    Array.isArray(raw) ||
    typeof Reflect.get(raw, 'key') !== 'string' ||
    !Object.hasOwn(raw, 'value')
  ) {
    throw new Error('Invalid storage entry');
  }
  const key: string = Reflect.get(raw, 'key');
  let value: unknown = Reflect.get(raw, 'value');
  if (!Object.hasOwn(raw, 'dates')) {
    const reviveLegacy = (v: unknown): unknown => {
      if (v === null || typeof v !== 'object') return v;
      if (
        !Array.isArray(v) &&
        Object.keys(v).length === 1 &&
        Object.hasOwn(v, dateMarker)
      ) {
        const time: unknown = Reflect.get(v, dateMarker);
        if (
          time === null ||
          (typeof time === 'number' && Number.isFinite(time))
        ) {
          return new Date(typeof time === 'number' ? time : NaN);
        }
      }
      for (const [k, child] of Object.entries(v))
        Reflect.set(v, k, reviveLegacy(child));
      return v;
    };
    value = reviveLegacy(value);
  } else {
    const dates: unknown = Reflect.get(raw, 'dates');
    if (!Array.isArray(dates)) throw new Error('Invalid date metadata');
    for (const date of dates as unknown[]) {
      if (date === null || typeof date !== 'object')
        throw new Error('Invalid date metadata');
      const path: unknown = Reflect.get(date, 'path');
      const time: unknown = Reflect.get(date, 'time');
      if (
        !Array.isArray(path) ||
        !path.every((part: unknown) => typeof part === 'string') ||
        !(time === null || (typeof time === 'number' && Number.isFinite(time)))
      ) {
        throw new Error('Invalid date metadata');
      }
      const restored = new Date(typeof time === 'number' ? time : NaN);
      if (path.length === 0) {
        if (value !== null) throw new Error('Invalid date path');
        value = restored;
      } else {
        let parent: unknown = value;
        for (const part of path.slice(0, -1)) {
          if (
            parent === null ||
            typeof parent !== 'object' ||
            !Object.hasOwn(parent, part)
          ) {
            throw new Error('Invalid date path');
          }
          parent = Reflect.get(parent, part);
        }
        const last: string = path[path.length - 1];
        if (
          parent === null ||
          typeof parent !== 'object' ||
          !Object.hasOwn(parent, last) ||
          Reflect.get(parent, last) !== null
        )
          throw new Error('Invalid date path');
        Reflect.set(parent, last, restored);
      }
    }
  }
  return { key, value };
}

export class FileStorageService implements IStorageService {
  private static readonly pending = new Map<string, Promise<unknown>>();
  private static readonly timeoutMs = 120_000;
  private readonly directory: string;

  constructor(
    directory = process.env['WATCHERSTATS_MCP_STORAGE_DIR'] ??
      envPaths('watcherstats-mcp').data,
  ) {
    this.directory = resolve(directory);
  }

  async getData<S>(storeName: string, key?: IDBValidKey): Promise<S[]> {
    const wanted = key === undefined ? undefined : serializeKey(key);
    return this.withStore(storeName, async (path, legacy) =>
      (await this.readStore(path, legacy))
        .filter((entry) => wanted === undefined || entry.key === wanted)
        .map((entry) => entry.value as S),
    );
  }

  async getDataById<S>(storeName: string, id: IDBValidKey): Promise<S | null> {
    const wanted = serializeKey(id);
    return this.withStore(storeName, async (path, legacy) => {
      const found = (await this.readStore(path, legacy)).find(
        (entry) => entry.key === wanted,
      );
      return found ? (found.value as S) : null;
    });
  }

  async addData<S>(
    storeName: string,
    data: S[],
    key?: IDBValidKey,
  ): Promise<void> {
    const updates = data.map((value) => ({
      key: serializeKey(key === undefined ? itemKey(storeName, value) : key),
      value,
    }));
    if (!updates.length) {
      this.validateName(storeName);
      if (key !== undefined) serializeKey(key);
      return;
    }
    await this.withStore(storeName, async (path, legacy) => {
      const entries = await this.readStore(path, legacy);
      const indexes = new Map(
        entries.map((entry, index) => [entry.key, index]),
      );
      for (const entry of updates) {
        const index = indexes.get(entry.key);
        if (index === undefined) {
          indexes.set(entry.key, entries.length);
          entries.push(entry);
        } else {
          entries[index] = entry;
        }
      }
      await this.writeStore(path, entries);
    });
  }

  async deleteData(
    storeName: string,
    keys: IDBValidKey | IDBValidKey[],
  ): Promise<void> {
    // Like IDBDatabaseStorageService, an array here is a list of keys.
    // Wrap an array key in another array to delete it.
    const wanted = new Set(
      (Array.isArray(keys) ? keys : [keys]).map((key) => serializeKey(key)),
    );
    await this.withStore(storeName, async (path, legacy) => {
      const entries = await this.readStore(path, legacy);
      const remaining = entries.filter((entry) => !wanted.has(entry.key));
      if (remaining.length !== entries.length)
        await this.writeStore(path, remaining);
    });
  }

  private validateName(name: string): void {
    if (
      typeof name !== 'string' ||
      name.length === 0 ||
      Buffer.from(name).toString('utf8') !== name
    ) {
      throw new TypeError('Store name must be a nonempty, well-formed string');
    }
  }

  private async withStore<T>(
    name: string,
    operation: (path: string, legacy: string) => Promise<T>,
  ): Promise<T> {
    this.validateName(name);
    await mkdir(this.directory, { recursive: true });
    const root = await realpath(this.directory);
    const dataDirectory = join(root, 'stores-v2');
    await mkdir(dataDirectory, { recursive: true });
    const directory = await realpath(dataDirectory);
    const digest = createHash('sha256').update(name).digest('hex');
    const path = join(directory, `store-${digest}.json`);
    const legacy = join(root, legacyFilename(name));
    const previous = FileStorageService.pending.get(path) ?? Promise.resolve();
    const current = previous
      .catch(() => undefined)
      .then(async () => {
        const server = await this.acquireLock(path);
        try {
          await this.checkLegacyLocks(legacy);
          await this.cleanupTemps(path);
          return await operation(path, legacy);
        } finally {
          await new Promise<void>((res, rej) =>
            server.close((error) => (error ? rej(error) : res())),
          );
        }
      });
    FileStorageService.pending.set(path, current);
    try {
      return await current;
    } finally {
      if (FileStorageService.pending.get(path) === current)
        FileStorageService.pending.delete(path);
    }
  }

  private async checkLegacyLocks(legacy: string): Promise<void> {
    for (const lock of [`${legacy}.lock`, `${legacy}.lock.recovery`]) {
      let owner: string;
      try {
        owner = await readFile(lock, 'utf8');
      } catch (error) {
        if (errorCode(error) === 'ENOENT') continue;
        throw error;
      }
      const pid = Number(owner);
      if (!Number.isSafeInteger(pid) || pid <= 0) {
        throw new Error(
          `Cannot determine owner of legacy storage lock: ${lock}`,
        );
      }
      try {
        process.kill(pid, 0);
      } catch (error) {
        if (errorCode(error) === 'ESRCH') {
          continue;
        }
        if (errorCode(error) !== 'EPERM') throw error;
      }
      throw new Error(`Legacy storage lock is held by process ${pid}: ${lock}`);
    }
  }

  private async acquireLock(path: string): Promise<Server> {
    const identity = process.platform === 'win32' ? path.toLowerCase() : path;
    const port =
      1024 +
      (createHash('sha256').update(identity).digest().readUInt32BE(0) %
        (65536 - 1024));
    const deadline = performance.now() + FileStorageService.timeoutMs;
    for (;;) {
      const server = createServer((socket) => socket.destroy());
      try {
        await new Promise<void>((res, rej) => {
          server.once('error', rej);
          server.listen({ host: '127.0.0.1', port, exclusive: true }, () => {
            server.removeListener('error', rej);
            res();
          });
        });
        return server;
      } catch (error) {
        if (errorCode(error) !== 'EADDRINUSE') throw error;
        if (performance.now() >= deadline)
          throw new Error(`Timed out waiting for storage lock: ${path}`);
        await new Promise((res) => setTimeout(res, 25));
      }
    }
  }

  private async cleanupTemps(path: string): Promise<void> {
    const prefix = `${basename(path)}.`;
    const directory = dirname(path);
    const names = await readdir(directory);
    for (const name of names) {
      if (
        name.startsWith(prefix) &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.tmp$/.test(
          name.slice(prefix.length),
        )
      ) {
        await rm(join(directory, name), { force: true });
      }
    }
  }

  private async readStore(
    path: string,
    legacy: string,
  ): Promise<StoredEntry[]> {
    let contents: string;
    try {
      contents = await readFile(path, 'utf8');
    } catch (error) {
      if (errorCode(error) !== 'ENOENT') throw error;
      try {
        await lstat(path);
      } catch (pathError) {
        if (errorCode(pathError) !== 'ENOENT') throw pathError;
        try {
          await lstat(legacy);
        } catch (legacyError) {
          if (errorCode(legacyError) === 'ENOENT') return [];
          throw legacyError;
        }
        // Old filenames do not record their store name and can collide.
        throw new Error(
          `Ambiguous legacy storage file requires manual migration: ${legacy}`,
        );
      }
      throw new Error(`Storage file exists but cannot be read: ${path}`, {
        cause: error,
      });
    }
    try {
      const parsed: unknown = JSON.parse(contents);
      if (!Array.isArray(parsed)) throw new Error('Expected an array');
      const entries = parsed.map(decodeEntry);
      if (new Set(entries.map((entry) => entry.key)).size !== entries.length) {
        throw new Error('Duplicate keys require manual recovery');
      }
      return entries;
    } catch (error) {
      const detail = error instanceof Error ? `: ${error.message}` : '';
      throw new Error(`Invalid storage file: ${path}${detail}`, {
        cause: error,
      });
    }
  }

  private async writeStore(
    path: string,
    entries: StoredEntry[],
  ): Promise<void> {
    const contents = JSON.stringify(entries.map(encodeEntry));
    const temp = `${path}.${randomUUID()}.tmp`;
    try {
      const file = await open(temp, 'wx', 0o600);
      try {
        await file.writeFile(contents, 'utf8');
        await file.sync();
      } finally {
        await file.close();
      }
      await rename(temp, path);
      if (process.platform !== 'win32') {
        const directory = await open(dirname(path), 'r');
        try {
          await directory.sync();
        } finally {
          await directory.close();
        }
      }
    } finally {
      await rm(temp, { force: true });
    }
  }
}
