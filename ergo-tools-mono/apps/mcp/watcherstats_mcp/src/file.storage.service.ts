import { createHash, randomUUID } from 'node:crypto';
import {
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { resolve } from 'node:path';
import { IStorageService } from '@ergo-tools/service';
import envPaths from 'env-paths';

interface StoredEntry {
  key: string;
  value: unknown;
}

const serializedDateKey = '__ergo_tools_storage_date__';

function isSerializedDate(
  value: unknown,
): value is { [serializedDateKey]: number | null } {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const timestamp = record[serializedDateKey];
  return Object.keys(record).length === 1 &&
    Object.hasOwn(record, serializedDateKey) &&
    (timestamp === null ||
      (typeof timestamp === 'number' && Number.isFinite(timestamp)));
}

export class FileStorageService implements IStorageService {
  private static readonly lockTimeoutMs = 120_000;
  private static readonly lockStaleMs = 30_000;
  private static readonly pendingOperations = new Map<string, Promise<unknown>>();
  private readonly directory: string;

  constructor(
    directory =
      process.env.WATCHERSTATS_MCP_STORAGE_DIR ??
      envPaths('watcherstats-mcp').data,
  ) {
    console.log(`Using storage directory: ${resolve(directory)}`);
    this.directory = resolve(directory);
  }

  async getData<S>(storeName: string, key?: IDBValidKey): Promise<S[]> {
    return this.withStore(storeName, async (filePath) => {
      const entries = await this.readStore(filePath);
      const matches = key === undefined
        ? entries
        : entries.filter((entry) => entry.key === this.serializeKey(key));
      return matches.map((entry) => entry.value as S);
    });
  }

  async getDataById<S>(storeName: string, id: IDBValidKey): Promise<S | null> {
    return this.withStore(storeName, async (filePath) => {
      const key = this.serializeKey(id);
      const entry = (await this.readStore(filePath))
        .find((candidate) => candidate.key === key);
      return (entry?.value as S | undefined) ?? null;
    });
  }

  async addData<S>(
    storeName: string,
    data: S[],
    key?: IDBValidKey,
  ): Promise<void> {
    await this.withStore(storeName, async (filePath) => {
      const entries = await this.readStore(filePath);
      const indexes = new Map<string, number>();
      entries.forEach((entry, index) => {
        if (!indexes.has(entry.key)) {
          indexes.set(entry.key, index);
        }
      });

      for (const item of data) {
        const itemId = key ?? this.getItemId(item) ?? randomUUID();
        const serializedKey = this.serializeKey(itemId);
        const existingIndex = indexes.get(serializedKey);
        const entry = { key: serializedKey, value: item };

        if (existingIndex === undefined) {
          indexes.set(serializedKey, entries.length);
          entries.push(entry);
        } else {
          entries[existingIndex] = entry;
        }
      }

      await this.writeStore(filePath, entries);
    });
  }

  async deleteData(
    storeName: string,
    keys: IDBValidKey | IDBValidKey[],
  ): Promise<void> {
    await this.withStore(storeName, async (filePath) => {
      const keysToDelete = new Set(
        (Array.isArray(keys) ? keys : [keys]).map((key) =>
          this.serializeKey(key),
        ),
      );
      const entries = await this.readStore(filePath);
      const remainingEntries = entries.filter(
        (entry) => !keysToDelete.has(entry.key),
      );

      if (remainingEntries.length !== entries.length) {
        await this.writeStore(filePath, remainingEntries);
      }
    });
  }

  private getItemId(item: unknown): IDBValidKey | undefined {
    if (item === null || typeof item !== 'object' || !('id' in item)) {
      return undefined;
    }

    return (item as { id?: IDBValidKey }).id;
  }

  private serializeKey(key: IDBValidKey): string {
    if (typeof key === 'string') {
      return `string:${key}`;
    }
    if (typeof key === 'number') {
      if (!Number.isFinite(key)) {
        throw new TypeError('Storage keys must be finite numbers');
      }
      return `number:${key === 0 ? 0 : key}`;
    }
    if (key instanceof Date) {
      const timestamp = key.getTime();
      if (!Number.isFinite(timestamp)) {
        throw new TypeError('Storage keys cannot be invalid dates');
      }
      return `date:${timestamp}`;
    }
    if (Array.isArray(key)) {
      return `array:${JSON.stringify(key.map((part) => this.serializeKey(part)))}`;
    }
    if (key instanceof ArrayBuffer) {
      return `binary:${Buffer.from(key).toString('base64')}`;
    }

    throw new TypeError('Unsupported storage key type');
  }

  private getFilePath(storeName: string): string {
    const sanitized = storeName
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '_')
      .replace(/^\.+/, '_')
      .slice(0, 64);
    const isReserved = /^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/.test(sanitized);
    // Add a hash whenever the name was altered so distinct stores never collide.
    const baseName =
      sanitized === storeName && !isReserved
        ? sanitized
        : `${sanitized}-${createHash('sha256').update(storeName).digest('hex').slice(0, 8)}`;
    return resolve(this.directory, `${baseName}.json`);
  }

  private async withStore<T>(
    storeName: string,
    operation: (filePath: string) => Promise<T>,
  ): Promise<T> {
    if (!storeName) {
      throw new TypeError('Store name must not be empty');
    }

    const filePath = this.getFilePath(storeName);
    const previousOperation =
      FileStorageService.pendingOperations.get(filePath) ?? Promise.resolve();
    const currentOperation = previousOperation
      .catch(() => undefined)
      .then(() => this.withFileLock(filePath, () => operation(filePath)));

    FileStorageService.pendingOperations.set(filePath, currentOperation);

    try {
      return await currentOperation;
    } finally {
      if (FileStorageService.pendingOperations.get(filePath) === currentOperation) {
        FileStorageService.pendingOperations.delete(filePath);
      }
    }
  }

  // Cross-process lock so multiple server instances sharing a directory don't clobber each other.
  private async withFileLock<T>(
    filePath: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    await mkdir(this.directory, { recursive: true });
    const lockPath = `${filePath}.lock`;
    const deadline = Date.now() + FileStorageService.lockTimeoutMs;

    for (;;) {
      try {
        await writeFile(lockPath, String(process.pid), { flag: 'wx' });
        break;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw error;
        }
        await this.removeAbandonedLock(lockPath);
        if (Date.now() >= deadline) {
          throw new Error(`Timed out waiting for storage lock: ${lockPath}`);
        }
        await new Promise((r) => setTimeout(r, 25));
      }
    }

    try {
      return await operation();
    } finally {
      await rm(lockPath, { force: true });
    }
  }

  private async removeAbandonedLock(lockPath: string): Promise<void> {
    try {
      const { mtimeMs } = await stat(lockPath);
      if (Date.now() - mtimeMs <= FileStorageService.lockStaleMs) {
        return;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return;
      }
      throw error;
    }

    // Serialize stale-lock recovery so one waiter cannot delete another's lock.
    const recoveryPath = `${lockPath}.recovery`;
    try {
      await writeFile(recoveryPath, String(process.pid), { flag: 'wx' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        return;
      }
      throw error;
    }

    try {
      let owner: string;
      try {
        const { mtimeMs } = await stat(lockPath);
        if (Date.now() - mtimeMs <= FileStorageService.lockStaleMs) {
          return;
        }
        owner = await readFile(lockPath, 'utf8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          return;
        }
        throw error;
      }

      const pid = Number(owner);
      if (Number.isSafeInteger(pid) && pid > 0) {
        try {
          process.kill(pid, 0);
          return;
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code;
          if (code === 'EPERM') {
            return;
          }
          if (code !== 'ESRCH') {
            throw error;
          }
        }
      }
      await rm(lockPath, { force: true });
    } finally {
      await rm(recoveryPath, { force: true });
    }
  }

  private async readStore(filePath: string): Promise<StoredEntry[]> {
    let contents: string;
    try {
      contents = await readFile(filePath, 'utf8');
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return [];
      }
      throw error;
    }

    let storedValue: unknown;
    try {
      storedValue = JSON.parse(contents, (_key, value: unknown) =>
        isSerializedDate(value)
          ? new Date(value[serializedDateKey] ?? Number.NaN)
          : value,
      );
    } catch {
      throw new Error(`Invalid storage file: ${filePath}`);
    }
    if (
      !Array.isArray(storedValue) ||
      storedValue.some(
        (entry) =>
          entry === null ||
          typeof entry !== 'object' ||
          typeof entry.key !== 'string' ||
          !('value' in entry),
      )
    ) {
      throw new Error(`Invalid storage file: ${filePath}`);
    }

    return storedValue as StoredEntry[];
  }

  private async writeStore(
    filePath: string,
    entries: StoredEntry[],
  ): Promise<void> {
    await mkdir(this.directory, { recursive: true });

    const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
    try {
      const contents = JSON.stringify(
        entries,
        function (this: Record<string, unknown>, key, value: unknown) {
          const originalValue = this[key];
          if (originalValue instanceof Date) {
            const timestamp = originalValue.getTime();
            return {
              [serializedDateKey]: Number.isFinite(timestamp)
                ? timestamp
                : null,
            };
          }
          return value;
        },
        2,
      );
      await writeFile(temporaryPath, contents, {
        flag: 'wx',
      });
      await rename(temporaryPath, filePath);
    } catch (error) {
      await rm(temporaryPath, { force: true });
      throw error;
    }
  }
}
