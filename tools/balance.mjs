import { build } from 'esbuild';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
const temp = await mkdtemp(join(tmpdir(), 'tower-balance-'));
try {
  const bundle = join(temp, 'benchmark.cjs');
  await build({
    entryPoints: [resolve('src/game/balance/benchmark.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: bundle,
  });
  const { balanceProfiles, BENCHMARK_STRATEGIES, simulate } = createRequire(import.meta.url)(
    bundle,
  );
  const quick = process.argv.includes('--quick');
  const verify = process.argv.includes('--verify');
  const only = process.argv.find((arg) => arg.startsWith('--profile='))?.split('=')[1];
  const limit = Number(
    process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] ?? 240,
  );
  const keys = Object.keys(BENCHMARK_STRATEGIES);
  const profiles = balanceProfiles();
  if (only && !profiles[only]) throw new Error(`Unknown profile: ${only}`);
  if (!Number.isFinite(limit) || limit <= 0) throw new Error('--limit must be positive seconds');
  const matchups = quick
    ? [
        ['balanced', 'heavy'],
        ['heavy', 'balanced'],
        ['rush', 'balanced'],
        ['swarm', 'heavy'],
        ['maze', 'rush'],
        ['balanced', 'balanced'],
      ]
    : keys.flatMap((first) => keys.map((second) => [first, second]));
  const rows = [];
  for (const [profile, config] of Object.entries(profiles)) {
    if (only && profile !== only) continue;
    for (const [first, second] of matchups)
      rows.push({
        profile,
        first,
        second,
        ...simulate(config, [BENCHMARK_STRATEGIES[first], BENCHMARK_STRATEGIES[second]], limit),
      });
    const current = rows.filter((row) => row.profile === profile);
    if (verify) {
      for (const row of current) {
        if (row.result?.reason !== 'leak-limit')
          throw new Error(`${profile}: ${row.first}/${row.second} did not finish in ${limit}s`);
        const reversed = current.find(
          (other) => other.first === row.second && other.second === row.first,
        );
        if (!reversed) continue;
        const flippedWinner = row.result.winnerId === null ? null : 3 - row.result.winnerId;
        if (
          reversed.seconds !== row.seconds ||
          reversed.result?.winnerId !== flippedWinner ||
          JSON.stringify(reversed.leaks) !== JSON.stringify([...row.leaks].reverse())
        )
          throw new Error(`${profile}: asymmetric result for ${row.first}/${row.second}`);
      }
    }
    console.log(
      JSON.stringify({
        profile,
        finished: current.filter((row) => row.result).length,
        games: current.length,
        typicalSeconds: current.filter((row) => row.result).map((row) => row.seconds),
        defaultMatch: current.find((row) => row.first === 'balanced' && row.second === 'heavy'),
        results: current.map((row) => ({
          pair: `${row.first}/${row.second}`,
          time: row.seconds,
          winner: row.result?.winnerId ?? null,
          leaks: row.leaks,
          produced: row.produced,
          towers: row.towers,
          maxLive: row.maxLive,
        })),
      }),
    );
  }
  const output = process.argv.find((arg) => arg.startsWith('--output='))?.slice('--output='.length);
  if (output) await writeFile(resolve(output), JSON.stringify(rows, null, 2) + '\n');
} finally {
  await rm(temp, { recursive: true, force: true });
}
