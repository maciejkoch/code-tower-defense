import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { JSDOM } from 'jsdom';

// Inspect built files only; no server or browser access is needed.
const output = resolve('dist/code-tower-defense/browser');
const prefix =
  process.argv.find((arg) => arg.startsWith('--base-href='))?.slice('--base-href='.length) ?? '/';
const { window } = new JSDOM(await readFile(resolve(output, 'index.html'), 'utf8'));
try {
  const document = window.document;
  if (document.querySelector('base')?.getAttribute('href') !== prefix)
    throw new Error(`Expected base href ${prefix}`);
  const references = [...document.querySelectorAll('script[src], link[href]')].map(
    (element) => element.getAttribute('src') ?? element.getAttribute('href'),
  );
  if (!references.some((value) => value?.endsWith('.js')))
    throw new Error('No application script in the build');
  // Loaded by PixiJS at runtime, so it does not appear in index.html references.
  await access(resolve(output, 'assets/mobs/chochlik/walk.png'));
  await access(resolve(output, 'assets/mobs/golem/walk.png'));
  await access(resolve(output, 'assets/board/terrain.png'));
  await access(resolve(output, 'assets/board/gate.png'));
  await access(resolve(output, 'assets/towers/crossbow.png'));
  await access(resolve(output, 'assets/towers/catapult.png'));
  for (const reference of references) {
    const url = new URL(reference, `https://pages.invalid${prefix}`);
    if (url.origin !== 'https://pages.invalid' || !url.pathname.startsWith(prefix))
      throw new Error(`Asset escapes the project path: ${reference}`);
    const file = resolve(output, decodeURIComponent(url.pathname.slice(prefix.length)));
    if (!file.startsWith(output + sep)) throw new Error(`Asset escapes the build: ${reference}`);
    await access(file);
  }
  let chunkImports = 0;
  for (const file of (await readdir(output)).filter((name) => name.endsWith('.js'))) {
    const code = await readFile(resolve(output, file), 'utf8');
    for (const match of code.matchAll(
      /\b(?:from\s*|import\s*\(\s*|import\s*)(['"])(\.\/[^'"]+\.js)\1/g,
    )) {
      await access(resolve(output, match[2]));
      chunkImports++;
    }
  }
  console.log(
    `Build base ${prefix}, ${references.length} assets and ${chunkImports} chunk imports verified.`,
  );
} finally {
  window.close();
}
