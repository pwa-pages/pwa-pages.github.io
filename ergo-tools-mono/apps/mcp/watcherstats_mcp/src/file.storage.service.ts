import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { deserialize, serialize } from 'node:v8';
import { IStorageService } from '@ergo-tools/service';
import envPaths from 'env-paths';

interface StoredEntry {
  key: string;
  value: unknown;
}

export class FileStorageService implements IStorageService {
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

      for (const item of data) {
        const itemId = key ?? this.getItemId(item) ?? randomUUID();
        const serializedKey = this.serializeKey(itemId);
        const existingIndex = entries.findIndex(
          (entry) => entry.key === serializedKey,
        );
        const entry = { key: serializedKey, value: item };

        if (existingIndex === -1) {
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
    const fileName = `${Buffer.from(storeName, 'utf8').toString('base64url')}.bin`;
    return resolve(this.directory, fileName);
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
      .then(() => operation(filePath));

    FileStorageService.pendingOperations.set(filePath, currentOperation);

    try {
      return await currentOperation;
    } finally {
      if (FileStorageService.pendingOperations.get(filePath) === currentOperation) {
        FileStorageService.pendingOperations.delete(filePath);
      }
    }
  }

  private async readStore(filePath: string): Promise<StoredEntry[]> {
    let contents: Buffer;
    try {
      contents = await readFile(filePath);
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

    const storedValue: unknown = deserialize(contents);
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
    await writeFile(temporaryPath, serialize(entries), { flag: 'wx' });
    await rename(temporaryPath, filePath);
  }
}
