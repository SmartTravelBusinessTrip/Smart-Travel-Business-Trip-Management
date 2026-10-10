import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const cli = resolve(dirname(fileURLToPath(import.meta.url)), '../node_modules/@playwright/test/cli.js');
const child = spawn(
  process.execPath,
  [cli, 'test', 'tests/e2e/e2e-01-employee-skip-ai-submit.spec.ts', '--project=chromium', '--headed'],
  { stdio: 'inherit', env: { ...process.env, E2E_DEMO: '1' } },
);

child.on('error', (error) => {
  console.error(`Could not start Playwright demo: ${error.message}`);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
