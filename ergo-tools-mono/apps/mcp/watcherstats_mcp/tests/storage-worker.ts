import { FileStorageService } from '../src/file.storage.service.js';

const [action, directory, argument] = process.argv.slice(2);

async function main(): Promise<void> {
  if (action === 'write') {
    const storage = new FileStorageService(directory);
    for (let i = 0; i < 10; i++) {
      await storage.addData('concurrent', [{ id: `${argument}-${i}` }]);
    }
  } else {
    throw new Error('Unknown action');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
