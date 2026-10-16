// Prints the markdown tables of bench/results/results.json. Usage: node bench/report.mjs
import { readFileSync } from 'node:fs';
import path from 'node:path';

const { apps, machine, node, runs, date } = JSON.parse(
  readFileSync(path.join(import.meta.dirname, 'results/results.json'), 'utf8'),
);
const names = ['gemkit', 'sveltekit', 'nuxt', 'next'].filter((name) => apps[name]);
const kb = (bytes) => (bytes / 1024).toFixed(1);
const table = (head, rows) =>
  [`| ${head.join(' | ')} |`, `| ${head.map((_, i) => (i ? '---:' : '---')).join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

const e2e = (name) => {
  try {
    const { stats } = JSON.parse(readFileSync(path.join(import.meta.dirname, `results/e2e-${name}.json`), 'utf8'));
    return `${stats.expected} / ${stats.expected + stats.unexpected + stats.flaky}`;
  } catch {
    return '-';
  }
};

console.log(`${machine}, Node ${node}, ${date.slice(0, 10)}, Lighthouse median of ${runs} runs\n`);

console.log('### Client JS (gzip, KB)\n');
console.log(
  table(
    ['', 'Home', 'Article', 'Profile', 'JS requests (home)'],
    names.map((n) => {
      const p = apps[n].pages;
      return [n, kb(p.home.jsGzip), kb(p.article.jsGzip), kb(p.profile.jsGzip), p.home.jsRequests];
    }),
  ),
);

for (const page of ['home', 'article', 'profile']) {
  console.log(`\n### Lighthouse: ${page} (mobile, simulated throttling)\n`);
  console.log(
    table(
      ['', 'Score', 'FCP (ms)', 'LCP (ms)', 'TBT (ms)', 'Speed Index (ms)', 'HTML (gzip, KB)'],
      names.map((n) => {
        const { lighthouse: l, htmlGzip } = apps[n].pages[page];
        return [n, l.score, l.fcp, l.lcp, l.tbt, l.si, kb(htmlGzip)];
      }),
    ),
  );
}

console.log('\n### SSR throughput (autocannon, 20 connections, 10 s)\n');
console.log(
  table(
    ['', 'Home req/s', 'Home p50 / p99 (ms)', 'Article req/s', 'Article p50 / p99 (ms)'],
    names.map((n) => {
      const { home, article } = apps[n].pages;
      return [
        n,
        home.load.rps,
        `${home.load.p50} / ${home.load.p99}`,
        article.load.rps,
        `${article.load.p50} / ${article.load.p99}`,
      ];
    }),
  ),
);

console.log('\n### Other\n');
console.log(
  table(
    ['', 'Client navigation home → article (ms)', 'Source lines', 'Official e2e passed'],
    names.map((n) => [n, apps[n].navigation ?? '-', apps[n].sourceLines, e2e(n)]),
  ),
);
