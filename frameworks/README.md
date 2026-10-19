# RealWorld：gemkit vs SvelteKit vs Nuxt vs Next.js

同一个 Conduit（Medium 克隆）应用，用四个 SSR 框架各实现一遍，接同一个本地后端，用同一份种子数据、同一份主题 CSS 测试。

| 应用 | 来源 | 版本 | 架构 |
| --- | --- | --- | --- |
| [gemkit](apps/gemkit) | 本仓库新写 | gemkit（[gem](https://github.com/mantou132/gem) `main` @ `a0fba746`，本地链接） | httpOnly cookie 登录，`*.server.ts` 中 `load` 和 form `actions`，`submitAction` 不刷新提交 |
| [sveltekit](apps/sveltekit) | [sveltejs/realworld](https://github.com/sveltejs/realworld) @ `df79670` | SvelteKit 2.52、Svelte 5 | httpOnly cookie 登录，`+page.server.js` 的 `load` 和 form actions |
| [nuxt](apps/nuxt) | 本仓库新写（社区没有完整的 Nuxt 3/4 版本），结构参照 SvelteKit 版 | Nuxt 4.6 | `useCookie` 保存 token，页面直接请求 API，文章 markdown 走 Nitro server route |
| [next](apps/next) | [yukicountry/realworld-nextjs-rsc](https://github.com/yukicountry/realworld-nextjs-rsc) @ `f455599` | Next.js 15.4、React 18 | App Router、React Server Components、Server Actions |

四个版本都在服务端转换 markdown（`marked` + `sanitize-html` 或 unified），这些库不进客户端包。

## 结果

Apple M2, 16 GB, Node v25.8.1, 2026-10-19, Lighthouse median of 5 runs

### Client JS (gzip, KB)

|  | Home | Article | Profile | JS requests (home) |
| --- | ---: | ---: | ---: | ---: |
| gemkit | 26.3 | 26.3 | 26.9 | 2 |
| sveltekit | 44.0 | 43.3 | 44.1 | 23 |
| nuxt | 85.8 | 85.5 | 85.8 | 15 |
| next | 103.5 | 126.5 | 104.6 | 8 |

### Lighthouse: home (mobile, simulated throttling, behind a compressing proxy)

|  | Score | FCP (ms) | LCP (ms) | TBT (ms) | Speed Index (ms) | HTML (gzip, KB) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| gemkit | 100 | 907 | 1424 | 0 | 907 | 3.0 |
| sveltekit | 100 | 1220 | 1673 | 0 | 1220 | 4.7 |
| nuxt | 99 | 1658 | 1808 | 3 | 1658 | 3.0 |
| next | 96 | 911 | 2033 | 12 | 911 | 5.6 |

### Lighthouse: article (mobile, simulated throttling, behind a compressing proxy)

|  | Score | FCP (ms) | LCP (ms) | TBT (ms) | Speed Index (ms) | HTML (gzip, KB) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| gemkit | 100 | 906 | 1556 | 0 | 906 | 3.3 |
| sveltekit | 100 | 1295 | 1673 | 0 | 1295 | 4.8 |
| nuxt | 99 | 1656 | 1656 | 0 | 1656 | 2.9 |
| next | 99 | 914 | 2028 | 7 | 914 | 5.7 |

### Lighthouse: profile (mobile, simulated throttling, behind a compressing proxy)

|  | Score | FCP (ms) | LCP (ms) | TBT (ms) | Speed Index (ms) | HTML (gzip, KB) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| gemkit | 100 | 906 | 1404 | 0 | 906 | 2.5 |
| sveltekit | 100 | 1286 | 1669 | 0 | 1286 | 4.2 |
| nuxt | 99 | 1657 | 1809 | 0 | 1657 | 2.4 |
| next | 94 | 913 | 2788 | 13 | 913 | 4.8 |

### SSR throughput (autocannon, 20 connections, 10 s, median of 5 rounds)

|  | Home req/s | Home p50 / p99 (ms) | Article req/s | Article p50 / p99 (ms) |
| --- | ---: | ---: | ---: | ---: |
| gemkit | 1123 | 16 / 37 | 1065 | 16 / 46 |
| sveltekit | 936 | 18 / 99 | 1201 | 16 / 27 |
| nuxt | 895 | 20 / 45 | 985 | 19 / 39 |
| next | 245 | 73 / 245 | 304 | 62 / 112 |

### Other

|  | Client navigation home → article (ms) | Source lines | Official e2e passed |
| --- | ---: | ---: | ---: |
| gemkit | 91 | 965 | 87 / 91 |
| sveltekit | 95 | 1143 | 6 / 93 |
| nuxt | 106 | 711 | 86 / 91 |
| next | 105 | 2712 | 60 / 91 |

> SSR 吞吐受共享后端限制：首页每次渲染要请求 `/api/articles` 和 `/api/tags`，后端单独压测分别是 2053 和 6892 req/s。所以这里比较的是同一后端下各框架的相对开销，不是框架的极限。

### 测量方法

- **Lighthouse、JS 体积、客户端导航**：经过 [`bench/proxy.mjs`](bench/proxy.mjs) 访问。这个代理模拟部署时的 CDN / 反向代理，向应用请求未压缩的内容，统一用 brotli（等级 5）压缩文本和未压缩的字体，每个 chunk 都 flush，不影响流式 SSR。各框架服务器默认的压缩行为不一样：Next 动态 gzip，SvelteKit（`adapter-node`）只给静态资源预压缩、HTML 不压缩，Nuxt 和 gemkit 都不压缩。实际部署时压缩通常由 CDN 或反向代理负责，所以这里统一交给代理，不比较各框架的默认值。
- **SSR 吞吐**：直连应用，autocannon 不发送 `Accept-Encoding`，各框架都不压缩。单次压测受机器状态影响很大（同一应用前后两次可以差 30% 以上），所以 4 个应用轮流测 5 轮，每轮换一次顺序，取 req/s 的中位数。
- **JS 体积**：统一用 gzip -6 计算，不依赖服务器的压缩设置。

### 怎么读这些数据

- **JS 体积**：gemkit 首页只有 2 个 JS 请求、26 kB（gzip），约为 SvelteKit 的 60%、Nuxt 的 31%、Next 的 25%。
- **Lighthouse**：gemkit 和 SvelteKit 都是 100 分，TBT 都是 0。gemkit 的 FCP 约 0.9 s，比 SvelteKit 快 310–390 ms；LCP 快 120–270 ms（1.40–1.56 s）。之前直连测时 gemkit 的 LCP 比 SvelteKit 慢约 300 ms，原因是 gemkit 服务器不压缩：两个阻塞渲染的 CSS（ionicons 和主题）未压缩是 80 kB，SvelteKit 发的是预压缩的 11 kB。
- **gemkit 的 LCP 不稳定**：在真实浏览器里，gemkit 页面的 LCP 元素（文章标题）就在 SSR 输出的 HTML 里，和 FCP 在同一帧绘制，水合也不会替换它。但 Lighthouse 的模拟算法（Lantern）会把真实绘制前已经下载完成的请求都算成 LCP 的依赖。本机加载很快，入口 JS 和异步 chunk 常常在首次绘制前就下载完，于是模拟的 LCP 在约 1.25 / 1.40 / 1.55 s 几档之间跳，`index.js` 多几百字节也会换档。对比 gem `161aa135` 和 `a0fba746` 两个版本，首页 LCP 从 1261 变成 1400–1550 ms，就是这个原因，不是渲染变慢了。
- **Nuxt 的 FCP 慢**：之前直连测时约 2.8 s，主要也是因为 Nuxt 服务器不压缩。统一压缩后是 1.66 s，仍比其他框架慢：Nuxt 默认把整个客户端模块图（15 个 JS、约 230 kB 未压缩）和阻塞渲染的 CSS 一起 modulepreload，在 Lighthouse 模拟的慢网络下 CSS 要和 JS 抢带宽。这是 Nuxt 的默认行为，不是配置错误。
- **Next 的 FCP 快、LCP 慢**：RSC 流式输出让首屏很早出现（约 0.91 s），但客户端要下载 100–130 kB 的 JS，LCP 在 2.0–2.8 s。
- **SSR 吞吐**：gemkit 和 SvelteKit 在波动范围内持平（首页 1123 / 936，文章页 1065 / 1201 req/s；同一应用 5 轮之间差得很多，SvelteKit 首页在 855–1385 之间，gemkit 首页在 750–1160 之间），比 Nuxt 高 8–25%，是 Next 的 3.5–4.6 倍。gemkit profiling 后修复了两处开销（见下面“框架问题”），首页从 661 提高到 1100–1250 req/s。压测时 gemkit 进程约 44% 的时间在等后端，gemkit 和 SvelteKit 都已经接近后端的上限。
- **客户端导航**：首页点击文章到标题出现，取 15 次的中位数，四个框架都在 90–110 ms 之间，主要是一次数据请求的时间，差别不大。单次波动在 50–100 ms 之间。
- **源码行数**：不含共享主题 CSS、静态资源和生成的类型文件。Next 版多是因为它用了 container/presentation 分层和 zod schema。

### e2e

用的是本仓库自带的官方测试集 [`specs/e2e`](../specs/e2e)（`TEST_MODE=ssr`，139 个用例，其中 48 个只适用于 SPA 模式会跳过）。新写的 gemkit 和 Nuxt 版按照 [`SELECTORS.md`](../specs/e2e/SELECTORS.md) 的约定实现：

- **gemkit / Nuxt** 剩下的失败：
  - `should require login to post comment`：页面上导航栏和评论区各有一个 `a[href="/login"]`，触发 Playwright 严格模式。
  - `should display popular tags`：后端 `/api/tags` 只返回最热门的一部分标签，新建的标签不在里面。
  - 图片 XSS 用例：头像 URL 是 `https://example.com/...`，在测试机上一次请求要 5 s 以上，页面 `load` 超时。
  - `should view article from home feed`：偶发。测试假设 URL 变化时新页面已经渲染，而 gemkit 和 Nuxt 是 URL 先变、新页面后渲染（见下面的“设计差异”），断言恰好落在中间就会失败。单独重复 5 次都通过。
- **SvelteKit / Next**：两个社区实现写于这套 e2e 约定之前，路由（`/profile/@user`、`?tag=`、`?feed=following`）、默认头像等和约定不一致，所以通过率低，不代表功能缺失。

## 为跑测试对社区实现做的改动

- 共同：用同一个本地后端；删掉外部 CDN 的 Google Fonts，ionicons 2.0.1 和主题 CSS 都改为本地加载（[`assets/theme/styles.css`](../assets/theme/styles.css)），避免外部网络影响测量。
- SvelteKit：`adapter-vercel` 换成 `adapter-node`，API 地址改为读环境变量。
- Next：主题 CSS 换成共享的版本（原来带了一份 133 kB 的旧 Bootstrap 主题），API 地址默认指向本地；评论 `id` 的 zod 类型从 `string` 改为 `coerce.string()`，原代码遇到返回整数 id 的后端（符合 API 规范）会让文章页直接报错。

## 写 gemkit 版时发现的框架问题

已在 gem 修复（这次的 gemkit 版依赖这些修复）：

- `*.server.ts` 的 `load` 拿不到请求，不能读写 cookie、不能重定向，也没有处理 POST 的方式 → 新增 `request`、`cookies`、`redirect()`、`notFound()`、form `actions`、`submitAction`、`prerender = false`
- 只改 query 的客户端导航不会重新执行 `load`（分页、`?feed=following`）
- 页面级 `load` 中 `redirect()` 时 SSR 返回 500
- Light DOM 元素模板返回 `undefined` 时，SSR 不输出 `innerHTML`
- 子元素先于父元素水合：通过属性（`.articles=${...}`）从父元素传下来的数据，在子元素第一次渲染（水合）时还不存在，触发 `hydration template mismatch` 并整段重渲染 → 父模板设置了属性的子元素推迟到父模板水合后再挂载。文章列表、首页视图因此可以做成独立元素（`<app-article-list>`、`<app-home>`），之前只能写成模板函数
- SSR 性能（CPU profiling 发现）：
  - `matchPath` 每次调用都新建 `URLPattern`，一次首页渲染要匹配约 40 次（每个 outlet 查找路由、每个路由的 `getContent` 检查是否匹配），占 CPU 时间 12% → 缓存编译后的 pattern；不含参数的 pattern 直接比较字符串（`URLPattern.exec` 每次约 2.5 µs，是正则的约 80 倍）
  - 响应流经过 `TextEncoderStream`，多一层 TransformStream，占 CPU 时间约 10% → 在 `ReadableStream` 的 `pull` 中直接用 `TextEncoder` 编码

设计差异（不算问题，但会影响测试）：

- **客户端导航先改 URL 再加载数据、渲染新页面**：和 Navigation API 默认的 `intercept()` 行为一致，点击后地址栏立即反馈，Nuxt（vue-router 先提交 URL，新页面在 Suspense 里等 `useFetch`）实际上也是这个顺序；SvelteKit/Next 则是数据加载完再一起更新 URL 和页面，保证 `location` 和 DOM 始终一致。gemkit 的代价是加载期间旧页面仍然显示，测试和用户脚本可能看到新 URL + 旧页面。如果改 URL 后立即渲染目标路由的 pending 状态，就能同时保留即时反馈和一致性。

## 复现

需要 Node 22+、pnpm、Bun（后端）、Chrome（默认路径是 Chrome Canary，可用 `CHROME_PATH` 指定）。gemkit 版通过 `link:` 依赖本地的 gem 仓库，需要把 [gem](https://github.com/mantou132/gem) 克隆到和本仓库同级的目录，并在其中执行 `pnpm install` 和 `pnpm -C packages/gemkit build`。

```bash
# 终端 1：本地后端（Nitro + Prisma + SQLite），每次启动都会重建数据库并写入种子数据
frameworks/bench/api.sh

# 终端 2
cd frameworks/bench && pnpm install && cd ../..
frameworks/bench/build.sh                     # 安装依赖并构建 4 个应用
frameworks/bench/e2e.sh                       # 官方 e2e，会写入测试数据，跑完后重启 api.sh
node frameworks/bench/measure.mjs             # JS 体积、Lighthouse、客户端导航（经过压缩代理）、SSR 吞吐（直连，轮流 5 轮）
node frameworks/bench/report.mjs              # 输出上面的表格
```

原始数据在 [`bench/results`](bench/results)。
