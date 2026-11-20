import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function loadToolDescription(fileName: string): string {
  try {
    return readFileSync(
      join(fileURLToPath(new URL('.', import.meta.url)), 'assets', fileName),
      'utf8',
    ).trim();
  } catch (error) {
    throw new Error(`Failed to load MCP tool description "${fileName}".`, {
      cause: error,
    });
  }
}
