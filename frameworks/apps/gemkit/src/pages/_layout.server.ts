import type { ServerLoadContext } from '@mantou/gemkit';

// 所有页面都依赖登录用户，不能预渲染
export const prerender = false;

export function load(ctx: ServerLoadContext) {
  const { user } = ctx.locals;
  return { user: user && { username: user.username, email: user.email, image: user.image, bio: user.bio } };
}
