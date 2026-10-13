import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Angular 22.2.2's chunk optimizer leaves a PixiJS BitmapFont chunk pointing
// at removed files. Preserve esbuild chunks; production minification remains on.
// https://github.com/angular/angular-cli/issues/34292 describes the related failure.
const cli = fileURLToPath(new URL('../node_modules/@angular/cli/bin/ng.js', import.meta.url));
const child = spawn(process.execPath, [cli, 'build', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, NG_BUILD_OPTIMIZE_CHUNKS: 'false' },
});
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
