import { cpSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
if (!existsSync('.next/standalone/server.js')) throw new Error('Run npm run build first');
cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
cpSync('public', '.next/standalone/public', { recursive: true });
// Use the same database as development despite the standalone server's cwd.
const { resolve } = await import('node:path');
const server = spawn(process.execPath, ['.next/standalone/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, HOSTNAME: '0.0.0.0', PORT: process.env.PORT || '8080', DATABASE_PATH: resolve(process.env.DATABASE_PATH || 'data/fairshift.db') },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
server.on('exit', code => process.exit(code ?? 1));
