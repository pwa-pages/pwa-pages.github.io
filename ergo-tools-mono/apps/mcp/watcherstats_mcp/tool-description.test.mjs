import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const projectDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = resolve(
  projectDir,
  '../../../dist/apps/mcp/watcherstats_mcp',
);

test('loads bundled descriptions relative to the module and reports missing files', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mcp descriptions '));
  try {
    const modulePath = join(dir, 'tool-description.mjs');
    await build({
      entryPoints: [join(projectDir, 'src/tool-description.ts')],
      outfile: modulePath,
      bundle: true,
      platform: 'node',
      format: 'esm',
    });
    await mkdir(join(dir, 'assets'));
    await writeFile(join(dir, 'assets/example.md'), '  Example description\n');
    const { loadToolDescription } = await import(
      pathToFileURL(modulePath).href
    );
    assert.equal(loadToolDescription('example.md'), 'Example description');
    assert.throws(
      () => loadToolDescription('missing.md'),
      (error) =>
        error.message === 'Failed to load MCP tool description "missing.md".' &&
        error.cause?.code === 'ENOENT',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test(
  'built stdio server advertises both descriptions',
  { timeout: 20000 },
  async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mcp server '));
    const child = spawn(process.execPath, [join(outputDir, 'main.js')], {
      cwd: dir,
      env: {
        ...process.env,
        MCP_TRANSPORT: 'stdio',
        WATCHERSTATS_MCP_STORAGE_DIR: dir,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
      stderr += data;
    });
    const lines = createInterface({ input: child.stdout });
    const exited = once(child, 'exit');
    let timer;
    try {
      const response = new Promise((resolveResponse, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Server did not respond: ${stderr}`)),
          15000,
        );
        child.once('error', reject);
        child.once('exit', (code) =>
          reject(new Error(`Server exited (${code}): ${stderr}`)),
        );
        lines.on('line', (line) => {
          try {
            const message = JSON.parse(line);
            if (message.id === 1) {
              child.stdin.write(
                `${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`,
              );
              child.stdin.write(
                `${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' })}\n`,
              );
            } else if (message.id === 2) {
              resolveResponse(message);
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      child.stdin.write(
        `${JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-03-26',
            capabilities: {},
            clientInfo: { name: 'description-test', version: '1.0.0' },
          },
        })}\n`,
      );
      const message = await response;
      assert.ok(message.result, JSON.stringify(message));
      for (const [name, file] of [
        ['get_watchers_stats', 'get-watchers-stats.md'],
        ['get_chain_perf', 'get-chain-perf.md'],
      ]) {
        const tool = message.result.tools.find((item) => item.name === name);
        assert.ok(tool, `Missing tool ${name}`);
        assert.equal(
          tool.description,
          (await readFile(join(outputDir, 'assets', file), 'utf8')).trim(),
        );
      }
    } finally {
      clearTimeout(timer);
      lines.close();
      child.kill();
      try {
        await exited;
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    }
  },
);
