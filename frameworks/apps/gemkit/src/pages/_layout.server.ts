import type { ServerLoadContext } from '@mantou/gemkit';

import { api, formString } from '../lib/api.server';

// 所有页面都依赖登录用户，不能预渲染
export const prerender = false;

export function load(ctx: ServerLoadContext) {
  const { user } = ctx.locals;
  return { user: user && { username: user.username, email: user.email, image: user.image, bio: user.bio } };
}

// 文章页面和各个页面的文章列表都可以收藏，根 layout 的 action 对所有页面都有效
export const actions = {
  toggleFavorite: async (ctx: ServerLoadContext) => {
    const form = await ctx.request.formData();
    const path = `articles/${encodeURIComponent(formString(form, 'slug'))}/favorite`;
    await api(ctx, path, form.get('favorited') ? 'DELETE' : 'POST');
  },
};
