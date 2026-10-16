import { notFound, redirect, type ServerLoadContext } from '@mantou/gemkit';

import { type ArticleListData, PAGE_SIZE, type User } from './types';

const base = process.env.API_BASE || 'http://localhost:3100/api';

type Context = Pick<ServerLoadContext, 'cookies'>;

/** 和 SvelteKit 版一样，登录用户（包含 token）以 base64 JSON 保存在 httpOnly cookie 中 */
export function getUser({ cookies }: Context): (User & { token: string }) | null {
  const jwt = cookies.get('jwt');
  return jwt ? JSON.parse(atob(jwt)) : null;
}

export function setUser({ cookies }: Context, user: User & { token: string }) {
  cookies.set('jwt', btoa(JSON.stringify(user)));
}

export function requireUser(ctx: Context) {
  const user = getUser(ctx);
  if (!user) redirect(302, '/login');
  return user;
}

/** 422 等返回 `{ errors }`，404 渲染 404 页面，其他错误抛出 */
export async function api<T = any>(ctx: Context, path: string, method = 'GET', data?: unknown): Promise<T> {
  const token = getUser(ctx)?.token;
  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      ...(data !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Token ${token}` }),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  if (res.ok || res.status === 422 || res.status === 401 || res.status === 403) {
    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
  }
  if (res.status === 404) notFound();
  throw new Error(`API ${method} ${path}: ${res.status}`);
}

export async function getArticles(
  ctx: Context & { url: URL },
  filter: Record<string, string>,
  feed = false,
): Promise<ArticleListData> {
  const page = Number(ctx.url.searchParams.get('page')) || 1;
  const query = new URLSearchParams({ ...filter, limit: `${PAGE_SIZE}`, offset: `${(page - 1) * PAGE_SIZE}` });
  const { articles = [], articlesCount = 0 } = await api(ctx, `${feed ? 'articles/feed' : 'articles'}?${query}`);
  return { articles, pages: Math.ceil(articlesCount / PAGE_SIZE) };
}

export const formString = (form: FormData, name: string) => String(form.get(name) ?? '');
