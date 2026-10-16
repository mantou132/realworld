import type { ServerLoadContext } from '@mantou/gemkit';

import { api, getArticles, requireUser } from '../../../lib/api.server';

type Context = ServerLoadContext<{ username: string }>;

export const load = (ctx: Context) => getArticles(ctx, { author: ctx.params.username });

export const actions = {
  toggleFollow: async (ctx: Context) => {
    requireUser(ctx);
    const form = await ctx.request.formData();
    const path = `profiles/${encodeURIComponent(ctx.params.username)}/follow`;
    await api(ctx, path, form.get('following') ? 'DELETE' : 'POST');
  },
};
