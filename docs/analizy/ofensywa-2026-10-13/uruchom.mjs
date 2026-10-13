import { build } from 'esbuild';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Exploratory rules apply only to this temporary bundle.
const temp = await mkdtemp(join(tmpdir(), 'ctd-offense-analysis-'));
try {
  const outfile = join(temp, 'analysis.cjs');
  await build({
    entryPoints: [fileURLToPath(new URL('./eksperyment.ts', import.meta.url))],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile,
    plugins: [{
      name: 'analysis-splash-cap',
      setup(builder) {
        builder.onLoad({ filter: /engine\/combat\.ts$/ }, async ({ path }) => {
          const source = await readFile(path, 'utf8');
          const marker = 'for (const mob of victims)';
          if (!source.includes(marker)) throw new Error('Combat changed; update the experiment.');
          const replacement = "for (const mob of (tower.type === 'splash' ? [target, ...victims.filter(m => m.id !== target.id).sort((a,b) => distance(a,target)-distance(b,target)||a.id-b.id)].slice(0,6) : victims))";
          return { contents: source.replace(marker, replacement), loader: 'ts' };
        });
      },
    }],
  });
  createRequire(import.meta.url)(outfile);
} finally {
  await rm(temp, { recursive: true, force: true });
}
