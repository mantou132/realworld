import type { ServerLoadContext } from '@mantou/gemkit';

import { getUser } from '../lib/api.server';

// 所有页面都依赖登录用户，不能预渲染
export const prerender = false;

export function load(ctx: ServerLoadContext) {
  const user = getUser(ctx);
  return { user: user && { username: user.username, email: user.email, image: user.image, bio: user.bio } };
}
