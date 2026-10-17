import { notFound, redirect, type ServerLoadContext } from '@mantou/gemkit';

import { type ArticleListData, PAGE_SIZE, type User } from './types';

const base = process.env.API_BASE || 'http://localhost:3100/api';

type Context = Pick<ServerLoadContext, 'cookies' | 'locals'>;

/** 登录或修改资料后保存用户，`locals.user` 在 `src/app.server.ts` 的 `handle` 中设置 */
export function setUser({ cookies, locals }: Context, user: User & { token: string }) {
  cookies.set('jwt', btoa(JSON.stringify(user)));
  locals.user = user;
}

/** 422 等返回 `{ errors }`，带 token 的请求 401 时清除登录并跳转到登录页，404 渲染 404 页面，其他错误抛出 */
export async function api<T = any>(ctx: Context, path: string, method = 'GET', data?: unknown): Promise<T> {
  const token = ctx.locals.user?.token;
  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      ...(data !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Token ${token}` }),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  // token 过期或无效；不带 token 的 401（登录密码错误）作为表单错误返回
  if (res.status === 401 && token) {
    ctx.cookies.delete('jwt');
    ctx.locals.user = undefined;
    redirect(302, '/login');
  }
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
