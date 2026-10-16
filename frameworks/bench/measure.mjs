// Builds nothing: run `bench/build.sh` first and keep `bench/api.sh` running.
// Usage: node bench/measure.mjs [app...]
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { gzipSync } from 'node:zlib';

import autocannon from 'autocannon';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(import.meta.dirname, '..');
const API = process.env.API_BASE || 'http://localhost:3100/api';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary';
const RUNS = Number(process.env.RUNS) || 5;

const apps = [
  { name: 'sveltekit', port: 4001, cmd: 'node build', env: { API_BASE: API }, profile: '/profile/@johndoe' },
  { name: 'next', port: 4002, cmd: 'npx next start', env: { API_BASE_URL: API } },
  { name: 'nuxt', port: 4003, cmd: 'node .output/server/index.mjs', env: { NUXT_PUBLIC_API_BASE: API } },
  { name: 'gemkit', port: 4004, cmd: 'npx gemkit start', env: { API_BASE: API } },
];

// 源码目录，不包括共享的主题 CSS、静态资源和生成的文件
const sources = {
  sveltekit: ['src'],
  next: ['src'],
  nuxt: ['app', 'server'],
  gemkit: ['src'],
};
const ignoredSources = /generated|main\.css|\.svg$|\.ico$/;

const median = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)];
const round = (n, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

function countLines(dir) {
  let lines = 0;
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name);
    if (ignoredSources.test(file)) continue;
    if (statSync(file).isDirectory()) lines += countLines(file);
    else lines += readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).length;
  }
  return lines;
}

async function startApp({ name, port, cmd, env }) {
  const child = spawn(cmd, {
    cwd: path.join(ROOT, 'apps', name),
    shell: true,
    env: { ...process.env, ...env, PORT: `${port}`, NODE_ENV: 'production' },
    stdio: 'ignore',
    detached: true,
  });
  const url = `http://localhost:${port}`;
  for (let i = 0; i < 300; i++) {
    try {
      if ((await fetch(url)).ok) return { url, stop: () => process.kill(-child.pid) };
    } catch {}
    await sleep(100);
  }
  throw new Error(`${name} did not start`);
}

/** 页面加载的 JS（统一用 gzip -6 计算压缩后大小，不依赖各框架服务器的压缩设置） */
async function measureBytes(browser, url) {
  const page = await browser.newPage();
  const scripts = new Map();
  page.on('response', async (res) => {
    const type = res.request().resourceType();
    if (type !== 'script' && type !== 'document') return;
    const body = await res.body().catch(() => null);
    if (body) scripts.set(res.url(), { type, raw: body.length, gzip: gzipSync(body).length });
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await sleep(500);
  await page.close();
  const sum = (type, key) =>
    [...scripts.values()].filter((e) => e.type === type).reduce((total, e) => total + e[key], 0);
  return {
    jsRequests: [...scripts.values()].filter((e) => e.type === 'script').length,
    jsRaw: sum('script', 'raw'),
    jsGzip: sum('script', 'gzip'),
    htmlRaw: sum('document', 'raw'),
    htmlGzip: sum('document', 'gzip'),
  };
}

/** 客户端导航：首页点击第一篇文章，到文章标题出现的时间 */
async function measureNavigation(browser, url) {
  const times = [];
  for (let i = 0; i < RUNS; i++) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await sleep(300);
    const link = page.locator('.preview-link').first();
    const title = await link.locator('h1').textContent();
    const start = Date.now();
    await link.click();
    // 不依赖各实现的页面结构（Next 版的标题不是 h1）：首页列表消失，页面中出现文章标题
    await page.waitForFunction(
      (t) => !document.querySelector('.preview-link') && document.body.innerText.includes(t),
      title.trim(),
    );
    times.push(Date.now() - start);
    await page.close();
  }
  return median(times);
}

async function runLighthouse(port, url) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    const { lhr } = await lighthouse(url, { port, onlyCategories: ['performance'], output: 'json', logLevel: 'error' });
    const audit = (id) => lhr.audits[id].numericValue;
    runs.push({
      score: lhr.categories.performance.score * 100,
      fcp: audit('first-contentful-paint'),
      lcp: audit('largest-contentful-paint'),
      tbt: audit('total-blocking-time'),
      si: audit('speed-index'),
    });
  }
  return Object.fromEntries(Object.keys(runs[0]).map((key) => [key, round(median(runs.map((r) => r[key])))]));
}

async function runLoad(url) {
  // 预热
  await autocannon({ url, connections: 10, duration: 3 });
  const result = await autocannon({ url, connections: 20, duration: 10 });
  return {
    rps: round(result.requests.average),
    p50: result.latency.p50,
    p99: result.latency.p99,
    errors: result.errors + result.non2xx,
  };
}

const selected = process.argv.slice(2);
const { articles } = await (await fetch(`${API}/articles?limit=1`)).json();
const pages = { home: '/', article: `/article/${articles[0].slug}`, profile: '/profile/johndoe' };

const resultsFile = path.join(ROOT, 'bench/results/results.json');

/** 每测完一个应用就写入，和已有的结果合并 */
function save() {
  mkdirSync(path.dirname(resultsFile), { recursive: true });
  let previous = {};
  try {
    previous = JSON.parse(readFileSync(resultsFile, 'utf8')).apps;
  } catch {}
  const output = {
    date: new Date().toISOString(),
    machine: process.env.BENCH_MACHINE || `${process.platform} ${process.arch}`,
    node: process.version,
    runs: RUNS,
    apps: { ...previous, ...results },
  };
  writeFileSync(resultsFile, `${JSON.stringify(output, null, 2)}\n`);
}

const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ['--headless=new'] });
const browser = await chromium.launch({ executablePath: CHROME });
const results = {};

for (const app of apps.filter((a) => !selected.length || selected.includes(a.name))) {
  console.log(`\n== ${app.name}`);
  const server = await startApp(app);
  try {
    const result = {
      sourceLines: sources[app.name].reduce((n, dir) => n + countLines(path.join(ROOT, 'apps', app.name, dir)), 0),
      pages: {},
    };
    for (const [name, pathname] of Object.entries(pages)) {
      const url = server.url + (name === 'profile' && app.profile ? app.profile : pathname);
      result.pages[name] = {
        ...(await measureBytes(browser, url)),
        lighthouse: await runLighthouse(chrome.port, url),
        ...(name !== 'profile' && { load: await runLoad(url) }),
      };
      console.log(name, JSON.stringify(result.pages[name]));
    }
    result.navigation = await measureNavigation(browser, server.url).catch((err) => {
      console.error('navigation failed', err.message);
      return null;
    });
    console.log('navigation', result.navigation);
    results[app.name] = result;
    save();
  } finally {
    server.stop();
    await sleep(500);
  }
}

await browser.close();
chrome.kill();
