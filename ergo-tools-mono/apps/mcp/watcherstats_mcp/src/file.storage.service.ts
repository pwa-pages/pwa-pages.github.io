import { randomUUID } from 'node:crypto';
import { mkdir, open } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import Database from 'better-sqlite3';
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
const knownKeyPaths = new Map<string, string[] | null>([
  ['inputBoxes', ['boxId', 'outputAddress']],
  ['perfTxs', ['id']],
  ['permitTxs', ['id']],
  ['activePermitTxs', ['id']],
  ['reportsStore', ['id']],
  ['downloads', null],
  ['watcherReports', null],
  ['downloadStatusStore', ['address']],
  ['openBoxesStore', ['address']],
  ['addressData', ['address']],
]);

function isWellFormedString(value: string): boolean {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      index++;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return false;
    }
  }
  return true;
}

function serializeKey(key: unknown, ancestors = new Set<unknown>()): string {
  if (typeof key === 'string') {
    return isWellFormedString(key)
      ? `string:${key}`
      : `string-utf16:${Buffer.from(key, 'utf16le').toString('base64')}`;
  }
  if (typeof key === 'number' && Number.isFinite(key))
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

function itemKey(
  store: string,
  item: unknown,
  explicitKey?: IDBValidKey,
): unknown {
  const fields = knownKeyPaths.get(store);
  if (fields !== undefined) {
    if (fields === null) {
      if (explicitKey === undefined) {
        throw new TypeError(`Missing explicit key for store ${store}`);
      }
      return explicitKey;
    }
    if (item === null || typeof item !== 'object') {
      throw new TypeError(`Missing key for store ${store}`);
    }
    const values = fields.map((field) => Reflect.get(item, field));
    if (values.some((value) => value === undefined)) {
      throw new TypeError(`Missing key for store ${store}`);
    }
    return values.length === 1 ? values[0] : values;
  }
  if (explicitKey !== undefined) return explicitKey;
  if (item !== null && typeof item === 'object' && 'id' in item) {
    return Reflect.get(item, 'id');
  }
  return randomUUID();
}

function encodeEntry(entry: StoredEntry): object {
  const dates: DatePath[] = [];
  const undefineds: string[][] = [];
  const paths = new WeakMap<object, string[]>();
  const json = JSON.stringify(
    entry.value,
    function (this: Record<string, unknown>, key, value: unknown) {
      const parentPath = paths.get(this) ?? [];
      const path = key === '' && !paths.has(this) ? [] : [...parentPath, key];
      const original = this[key];
      if (original === undefined) {
        undefineds.push(path);
        return null;
      }
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
  return { key: entry.key, value: JSON.parse(json), dates, undefineds };
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
    const undefineds: unknown = Object.hasOwn(raw, 'undefineds')
      ? Reflect.get(raw, 'undefineds')
      : [];
    if (!Array.isArray(undefineds))
      throw new Error('Invalid undefined metadata');
    for (const path of undefineds as unknown[]) {
      if (
        !Array.isArray(path) ||
        !path.every((part: unknown) => typeof part === 'string')
      ) {
        throw new Error('Invalid undefined metadata');
      }
      if (path.length === 0) {
        if (value !== null) throw new Error('Invalid undefined path');
        value = undefined;
      } else {
        let parent: unknown = value;
        for (const part of path.slice(0, -1)) {
          if (
            parent === null ||
            typeof parent !== 'object' ||
            !Object.hasOwn(parent, part)
          ) {
            throw new Error('Invalid undefined path');
          }
          parent = Reflect.get(parent, part);
        }
        const last: string = path[path.length - 1];
        if (
          parent === null ||
          typeof parent !== 'object' ||
          !Object.hasOwn(parent, last) ||
          Reflect.get(parent, last) !== null
        ) {
          throw new Error('Invalid undefined path');
        }
        Reflect.set(parent, last, undefined);
      }
    }

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
  private readonly directory: string;
  private database?: Database.Database;
  private databasePromise?: Promise<Database.Database>;
  private closed = false;

  constructor(
    directory = process.env['WATCHERSTATS_MCP_STORAGE_DIR'] ??
      envPaths('watcherstats-mcp').data,
  ) {
    this.directory = resolve(directory);
  }

  async getData<S>(storeName: string, key?: IDBValidKey): Promise<S[]> {
    this.validateName(storeName);
    const wanted = key === undefined ? undefined : serializeKey(key);
    return this.withDatabase((database) => {
      const rows =
        wanted === undefined
          ? database
              .prepare(
                'SELECT key, value FROM storage_entries WHERE store_name = ? ORDER BY position',
              )
              .all(storeName)
          : database
              .prepare(
                'SELECT key, value FROM storage_entries WHERE store_name = ? AND key = ? ORDER BY position',
              )
              .all(storeName, wanted);
      return rows.map((row) => this.decodeRow(row, storeName) as S);
    });
  }

  async getDataById<S>(storeName: string, id: IDBValidKey): Promise<S | null> {
    this.validateName(storeName);
    const wanted = serializeKey(id);
    return this.withDatabase((database) => {
      const row = database
        .prepare(
          'SELECT key, value FROM storage_entries WHERE store_name = ? AND key = ?',
        )
        .get(storeName, wanted);
      return row === undefined
        ? null
        : ((this.decodeRow(row, storeName) as S | null | undefined) ?? null);
    });
  }

  async addData<S>(
    storeName: string,
    data: S[],
    key?: IDBValidKey,
  ): Promise<void> {
    this.validateName(storeName);
    const updates = data.map((value) => ({
      key: serializeKey(itemKey(storeName, value, key)),
      value,
    }));
    if (!updates.length) return;
    await this.withDatabase((database) => {
      const upsert = database.prepare(`
        INSERT INTO storage_entries (store_name, key, value)
        VALUES (?, ?, ?)
        ON CONFLICT (store_name, key)
        DO UPDATE SET value = excluded.value
      `);
      database.transaction(() => {
        for (const entry of updates) {
          upsert.run(storeName, entry.key, JSON.stringify(encodeEntry(entry)));
        }
      })();
    });
  }

  async deleteData(
    storeName: string,
    keys: IDBValidKey | IDBValidKey[],
  ): Promise<void> {
    this.validateName(storeName);
    // Like IDBDatabaseStorageService, an array here is a list of keys.
    // Wrap an array key in another array to delete it.
    const wanted = new Set(
      (Array.isArray(keys) ? keys : [keys]).map((key) => serializeKey(key)),
    );
    await this.withDatabase((database) => {
      const remove = database.prepare(
        'DELETE FROM storage_entries WHERE store_name = ? AND key = ?',
      );
      database.transaction(() => {
        for (const key of wanted) remove.run(storeName, key);
      })();
    });
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.database?.close();
    this.database = undefined;
    this.databasePromise = undefined;
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

  private async withDatabase<T>(
    operation: (database: Database.Database) => T,
  ): Promise<T> {
    const database = await this.getDatabase();
    if (this.closed || database !== this.database) {
      throw new Error('Storage service is closed');
    }
    return operation(database);
  }

  private getDatabase(): Promise<Database.Database> {
    if (this.closed) {
      return Promise.reject(new Error('Storage service is closed'));
    }
    if (this.databasePromise) return this.databasePromise;

    let opening: Promise<Database.Database>;
    opening = this.openDatabase()
      .then((database) => {
        if (this.closed) {
          database.close();
          throw new Error('Storage service is closed');
        }
        this.database = database;
        return database;
      })
      .catch((error: unknown) => {
        if (this.databasePromise === opening) this.databasePromise = undefined;
        throw error;
      });
    this.databasePromise = opening;
    return opening;
  }

  private async openDatabase(): Promise<Database.Database> {
    await mkdir(this.directory, { recursive: true });
    const path = join(this.directory, 'watcherstats-mcp.sqlite');
    const file = await open(path, 'a', 0o600);
    await file.close();
    const database = new Database(path);
    try {
      database.pragma('busy_timeout = 120000');
      database.pragma('journal_mode = WAL');
      database.pragma('synchronous = FULL');
      database.exec(`
        CREATE TABLE IF NOT EXISTS storage_entries (
          position INTEGER PRIMARY KEY AUTOINCREMENT,
          store_name TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          UNIQUE (store_name, key)
        )
      `);
      return database;
    } catch (error) {
      database.close();
      throw error;
    }
  }

  private decodeRow(row: unknown, storeName: string): unknown {
    if (row === null || typeof row !== 'object') {
      throw new Error('Invalid SQLite storage row');
    }
    const key: unknown = Reflect.get(row, 'key');
    const value: unknown = Reflect.get(row, 'value');
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new Error('Invalid SQLite storage row');
    }
    try {
      const entry = decodeEntry(JSON.parse(value));
      if (entry.key !== key) throw new Error('Mismatched SQLite storage key');
      return entry.value;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to decode storage entry from "${storeName}" for key ${JSON.stringify(key)}: ${detail}`,
        { cause: error },
      );
    }
  }
}
