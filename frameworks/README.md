# RealWorld：gemkit vs SvelteKit vs Nuxt vs Next.js

同一个 Conduit（Medium 克隆）应用，用四个 SSR 框架各实现一遍，接同一个本地后端，用同一份种子数据、同一份主题 CSS 测试。

| 应用 | 来源 | 版本 | 架构 |
| --- | --- | --- | --- |
| [gemkit](apps/gemkit) | 本仓库新写 | gemkit（[gem](https://github.com/mantou132/gem) `main` @ `46cd3276`，本地链接） | httpOnly cookie 登录，`*.server.ts` 中 `load` 和 form `actions`，`submitAction` 不刷新提交 |
| [sveltekit](apps/sveltekit) | [sveltejs/realworld](https://github.com/sveltejs/realworld) @ `df79670` | SvelteKit 2.52、Svelte 5 | httpOnly cookie 登录，`+page.server.js` 的 `load` 和 form actions |
| [nuxt](apps/nuxt) | 本仓库新写（社区没有完整的 Nuxt 3/4 版本），结构参照 SvelteKit 版 | Nuxt 4.6 | `useCookie` 保存 token，页面直接请求 API，文章 markdown 走 Nitro server route |
| [next](apps/next) | [yukicountry/realworld-nextjs-rsc](https://github.com/yukicountry/realworld-nextjs-rsc) @ `f455599` | Next.js 15.4、React 18 | App Router、React Server Components、Server Actions |

四个版本都在服务端转换 markdown（`marked` + `sanitize-html` 或 unified），这些库不进客户端包。

## 结果

Apple M2, 16 GB, Node v25.8.1, 2026-10-16, Lighthouse median of 5 runs

### Client JS (gzip, KB)

|  | Home | Article | Profile | JS requests (home) |
| --- | ---: | ---: | ---: | ---: |
| gemkit | 25.0 | 25.1 | 25.7 | 2 |
| sveltekit | 44.0 | 43.3 | 44.1 | 23 |
| nuxt | 85.8 | 85.5 | 85.8 | 15 |
| next | 103.5 | 126.5 | 104.6 | 8 |

### Lighthouse: home (mobile, simulated throttling)

|  | Score | FCP (ms) | LCP (ms) | TBT (ms) | Speed Index (ms) | HTML (gzip, KB) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| gemkit | 99 | 1352 | 2145 | 0 | 1352 | 3.0 |
| sveltekit | 99 | 1431 | 1812 | 0 | 1431 | 4.7 |
| nuxt | 89 | 2855 | 3006 | 2 | 2855 | 3.0 |
| next | 96 | 907 | 2027 | 7 | 908 | 5.6 |

### Lighthouse: article (mobile, simulated throttling)

|  | Score | FCP (ms) | LCP (ms) | TBT (ms) | Speed Index (ms) | HTML (gzip, KB) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| gemkit | 99 | 1352 | 2144 | 0 | 1352 | 3.3 |
| sveltekit | 99 | 1364 | 1808 | 0 | 1364 | 4.8 |
| nuxt | 91 | 2703 | 2854 | 0 | 2703 | 2.9 |
| next | 96 | 1658 | 2712 | 18 | 1658 | 5.7 |

### Lighthouse: profile (mobile, simulated throttling)

|  | Score | FCP (ms) | LCP (ms) | TBT (ms) | Speed Index (ms) | HTML (gzip, KB) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| gemkit | 99 | 1352 | 2146 | 0 | 1352 | 2.5 |
| sveltekit | 99 | 1433 | 1816 | 0 | 1433 | 4.2 |
| nuxt | 91 | 2703 | 2855 | 0 | 2703 | 2.4 |
| next | 94 | 910 | 2793 | 14 | 910 | 4.8 |

### SSR throughput (autocannon, 20 connections, 10 s)

|  | Home req/s | Home p50 / p99 (ms) | Article req/s | Article p50 / p99 (ms) |
| --- | ---: | ---: | ---: | ---: |
| gemkit | 661 | 27 / 76 | 871 | 20 / 58 |
| sveltekit | 1435 | 13 / 23 | 1078 | 17 / 37 |
| nuxt | 854 | 22 / 44 | 894 | 20 / 54 |
| next | 252 | 77 / 134 | 257 | 72 / 156 |

### Other

|  | Client navigation home → article (ms) | Source lines | Official e2e passed |
| --- | ---: | ---: | ---: |
| gemkit | 83 | 954 | 88 / 91 |
| sveltekit | 91 | 1143 | 6 / 93 |
| nuxt | 101 | 711 | 87 / 91 |
| next | 90 | 2712 | 62 / 91 |

> SSR 吞吐受共享后端限制：首页每次渲染要请求 `/api/articles` 和 `/api/tags`，后端单独压测分别是 2053 和 6892 req/s。所以这里比较的是同一后端下各框架的相对开销，不是框架的极限。

### 怎么读这些数据

- **JS 体积**：gemkit 首页只有 2 个 JS 请求、25 kB（gzip），约为 SvelteKit 的 57%、Nuxt 的 29%、Next 的 24%。
- **Lighthouse**：gemkit 和 SvelteKit 都是 99 分，TBT 都是 0。gemkit 的 FCP 略快，LCP 比 SvelteKit 慢约 300 ms，原因还没查清楚。
- **Nuxt 的 FCP 慢**：Nuxt 默认把整个客户端模块图（15 个 JS、约 230 kB 未压缩）和两个阻塞渲染的 CSS 一起 modulepreload。在 Lighthouse 模拟的慢网络下，CSS 被挤到 1.2–1.5 s 后才到，FCP 被拖到约 2.8 s。这是 Nuxt 的默认行为，不是配置错误。
- **Next 的 FCP 快、LCP 慢**：RSC 流式输出让首屏很早出现，但客户端要下载 100–130 kB 的 JS。
- **SSR 吞吐**：gemkit 是 SvelteKit 的 46%（首页）/ 81%（文章页）；首页比 Nuxt 低 23%，文章页和 Nuxt 持平；是 Next 的 2.6–3.4 倍。gemkit SSR 慢在哪里还没有做 profiling。
- **客户端导航**：首页点击文章到标题出现，四个框架都在 80–100 ms 之间，主要是一次数据请求的时间，差别不大。
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
node frameworks/bench/measure.mjs             # JS 体积、Lighthouse、SSR 吞吐、客户端导航
node frameworks/bench/report.mjs              # 输出上面的表格
```

原始数据在 [`bench/results`](bench/results)。
