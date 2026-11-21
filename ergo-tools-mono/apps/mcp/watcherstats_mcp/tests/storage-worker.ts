import { createHash } from 'node:crypto';
import { createServer } from 'node:net';
import { join, resolve } from 'node:path';
import { FileStorageService } from '../src/file.storage.service.js';

const [action, directory, argument] = process.argv.slice(2);

async function main(): Promise<void> {
  if (action === 'write') {
    const storage = new FileStorageService(directory);
    for (let i = 0; i < 10; i++) {
      await storage.addData('concurrent', [{ id: `${argument}-${i}` }]);
    }
  } else if (action === 'large-write') {
    const storage = new FileStorageService(directory);
    await storage.addData('interrupted', [
      { id: 'large', payload: 'x'.repeat(32 * 1024 * 1024) },
    ]);
  } else if (action === 'hold') {
    const digest = createHash('sha256').update('concurrent').digest('hex');
    let path = join(resolve(directory), 'stores-v2', `store-${digest}.json`);
    if (process.platform === 'win32') path = path.toLowerCase();
    const port =
      1024 +
      (createHash('sha256').update(path).digest().readUInt32BE(0) %
        (65536 - 1024));
    const server = createServer((socket) => socket.destroy());
    server.listen({ host: '127.0.0.1', port, exclusive: true }, () => {
      process.stdout.write('ready\n');
    });
  } else {
    throw new Error('Unknown action');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
