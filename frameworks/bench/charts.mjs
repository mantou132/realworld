// Renders comparison charts (2048×1152 PNG, for social posts) from bench/results/results.json.
// Usage: node bench/charts.mjs  → bench/results/charts/*.png
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { chromium } from 'playwright-core';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary';
const { apps, date } = JSON.parse(readFileSync(path.join(import.meta.dirname, 'results/results.json'), 'utf8'));
const outDir = path.join(import.meta.dirname, 'results/charts');

const order = ['gemkit', 'sveltekit', 'nuxt', 'next'];
const labels = { gemkit: 'Gemkit', sveltekit: 'SvelteKit', nuxt: 'Nuxt', next: 'Next.js' };
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const fmt = (n) => n.toLocaleString('en-US');
const day = date.slice(0, 10);
const e2e = JSON.parse(readFileSync(path.join(import.meta.dirname, 'results/e2e-gemkit.json'), 'utf8')).stats;

/** 一组横向柱状图：gemkit 高亮，其他灰色；每根柱子都直接标数值 */
function bars({ title, hint, rows, max, note }) {
  const top = max ?? Math.max(...rows.map((r) => r.value));
  return `<section class="panel">
    <h3>${title}<span>${hint}</span></h3>
    ${rows
      .map(
        (r) => `<div class="row${r.name === 'gemkit' ? ' hl' : ''}">
          <div class="name">${labels[r.name]}</div>
          <div class="track">
            <div class="bar" style="width:calc((100% - 130px) * ${Math.max(r.value / top, 0.006)})"></div>
            <div class="value">${r.text}${r.extra ? `<span class="extra">${r.extra}</span>` : ''}</div>
          </div>
        </div>`,
      )
      .join('')}
    ${note ? `<p class="note">${note}</p>` : ''}
  </section>`;
}

function page({ kicker, headline, sub, panels, footer, cols = panels.length }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; margin: 0; }
    body { width: 1024px; height: 576px; background: #121316; color: #e8e9ec;
      font-family: -apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif; padding: 48px 56px 34px;
      display: flex; flex-direction: column; }
    .kicker { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: #8b8f99; }
    h1 { font-size: 40px; font-weight: 700; letter-spacing: -.015em; margin-top: 8px; }
    h1 em { font-style: normal; color: #5cc27a; }
    .sub { font-size: 16px; color: #a9adb6; margin-top: 10px; line-height: 1.45; }
    .grid { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 56px; margin-top: 40px; }
    h3 { font-size: 15px; font-weight: 600; color: #e8e9ec; margin-bottom: 16px; }
    h3 span { font-weight: 400; color: #8b8f99; margin-left: 8px; }
    .row { display: grid; grid-template-columns: 88px 1fr; align-items: center; column-gap: 12px; height: 48px; }
    .name { font-size: 16px; font-weight: 600; color: #c9ccd3; }
    .row.hl .name { color: #fff; }
    .track { display: flex; align-items: center; gap: 10px; height: 32px; }
    .bar { height: 100%; flex: none; background: #4b505b; border-radius: 0 4px 4px 0; }
    .row.hl .bar { background: #3f9e5c; }
    .value { font-size: 16px; font-weight: 600; color: #e8e9ec; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .extra { font-size: 13px; font-weight: 400; color: #8b8f99; margin-left: 8px; }
    .note { font-size: 12px; color: #8b8f99; margin-top: 12px; line-height: 1.5; }
    footer { margin-top: auto; display: flex; justify-content: space-between; font-size: 12.5px; color: #8b8f99; }
    footer b { color: #e8e9ec; font-weight: 600; }
  </style></head><body>
    <div class="kicker">${kicker}</div>
    <h1>${headline}</h1>
    ${sub ? `<p class="sub">${sub}</p>` : ''}
    <div class="grid">${panels.join('')}</div>
    <footer><span>${footer}</span><b>github.com/mantou132/realworld</b></footer>
  </body></html>`;
}

const rowsOf = (pick, text, extra) =>
  order.map((name) => ({ name, value: pick(apps[name]), text: text(pick(apps[name])), extra: extra?.(apps[name]) }));
const home = (a) => a.pages.home;
const ratio = (a, b) => (a / b).toFixed(1);

const g = apps.gemkit.pages;
const s = apps.sveltekit.pages;
const n = apps.next.pages;

const charts = {
  '1-js': page({
    kicker: 'RealWorld (Conduit) · same app, same API, same CSS',
    headline: `Gemkit ships <em>${Math.round(n.home.jsGzip / g.home.jsGzip)}× less JS</em> than Next.js`,
    sub: `Client JavaScript loaded by each page, gzip. Gemkit's home page needs ${g.home.jsRequests} requests; SvelteKit makes ${s.home.jsRequests}.`,
    panels: [
      bars({
        title: 'Home page',
        hint: 'gzip · lower is better',
        rows: rowsOf((a) => home(a).jsGzip, kb, (a) => `${home(a).jsRequests} requests`),
      }),
      bars({
        title: 'Article page',
        hint: 'gzip · lower is better',
        rows: rowsOf((a) => a.pages.article.jsGzip, kb),
      }),
    ],
    footer: `Apple M2 · Node 25 · Next 15.4 · Nuxt 4.6 · SvelteKit 2.52 · ${day}`,
  }),
  '2-ssr': page({
    kicker: 'Server-side rendering · Node, direct connection',
    headline: `SSR throughput: <em>on par with SvelteKit</em>`,
    sub: `Profiling fixed two hot spots in Gemkit (route matching and response encoding): home page went from 661 to ${fmt(g.home.load.rps)} req/s. ${ratio(g.home.load.rps, n.home.load.rps)}× Next.js.`,
    panels: [
      bars({
        title: 'Home page',
        hint: 'req/s · higher is better',
        rows: rowsOf((a) => home(a).load.rps, fmt),
      }),
      bars({
        title: 'Article page',
        hint: 'req/s · higher is better',
        rows: rowsOf((a) => a.pages.article.load.rps, fmt),
      }),
    ],
    footer: 'autocannon · 20 connections · 10 s · median of 5 interleaved rounds · shared local API (Nitro + Prisma)',
  }),
  '3-lighthouse': page({
    kicker: 'Lighthouse 13 · mobile · home page',
    headline: `First paint in <em>0.9 s</em>, zero blocking time`,
    sub: `Performance ${home(apps.gemkit).lighthouse.score}, TBT ${home(apps.gemkit).lighthouse.tbt} ms on home, article and profile. Behind the same brotli proxy for every app.`,
    panels: [
      bars({
        title: 'First Contentful Paint',
        hint: 'lower is better',
        rows: rowsOf((a) => home(a).lighthouse.fcp, (v) => `${fmt(v)} ms`),
      }),
      bars({
        title: 'Largest Contentful Paint',
        hint: 'lower is better',
        rows: rowsOf((a) => home(a).lighthouse.lcp, (v) => `${fmt(v)} ms`),
      }),
    ],
    footer: 'simulated slow 4G · median of 5 runs · article and profile pages in the repo',
  }),
  '4-dx': page({
    kicker: 'Client navigation & code size',
    headline: `Client navigation in <em>${apps.gemkit.navigation} ms</em>`,
    sub: `Gemkit passes ${e2e.expected} of ${e2e.expected + e2e.unexpected + e2e.flaky} official RealWorld e2e tests (SSR mode); the rest are shared spec/network issues listed in the repo.`,
    panels: [
      bars({
        title: 'Home → article navigation',
        hint: 'ms · lower is better',
        rows: rowsOf((a) => a.navigation, (v) => `${v} ms`),
      }),
      bars({
        title: 'Source lines',
        hint: 'excluding shared CSS & assets',
        rows: rowsOf((a) => a.sourceLines, fmt),
      }),
    ],
    footer: 'navigation: click an article on the home page until its title renders · median of 15',
  }),
};

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const pageCtx = await browser.newPage({ viewport: { width: 1024, height: 576 }, deviceScaleFactor: 2 });
for (const [name, html] of Object.entries(charts)) {
  await pageCtx.setContent(html);
  const file = path.join(outDir, `${name}.png`);
  await pageCtx.screenshot({ path: file });
  console.log(file);
}
await browser.close();
