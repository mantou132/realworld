import type { RequestEvent } from '@mantou/gemkit';

import type { User } from './lib/types';

declare module '@mantou/gemkit' {
  interface Locals {
    /** 登录用户，包含调用 API 的 token */
    user?: User & { token: string };
  }
}

// 需要登录的页面
const isPrivatePath = (path: string) => /^\/(settings|editor)(\/|$)/.test(path);
// 登录后不再访问的页面
const isGuestPath = (path: string) => path === '/login' || path === '/register';

/**
 * 和 SvelteKit 版一样，登录用户（包含 token）以 base64 JSON 保存在 httpOnly cookie 中，
 * 每个请求解析一次放到 `locals`，并统一检查页面和 action 的权限
 */
export function handle({ path, url, request, cookies, locals }: RequestEvent) {
  const jwt = cookies.get('jwt');
  if (jwt) {
    try {
      locals.user = JSON.parse(atob(jwt));
    } catch {
      // 无法解析的 cookie 按未登录处理并清除，避免每个页面都报错
      cookies.delete('jwt');
    }
  }
  if (locals.user) {
    if (isGuestPath(path)) redirect(302, '/');
    return;
  }
  const feed = path === '/' && url.searchParams.get('feed') === 'following';
  // 除了登录和注册，所有 action（收藏、关注、评论等）都需要登录
  const action = request.method === 'POST' && !isGuestPath(path);
  if (feed || action || isPrivatePath(path)) redirect(302, '/login');
}
