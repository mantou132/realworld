import type { ServerLoadContext } from '@mantou/gemkit';

import { api } from '../../../lib/api.server';
import type { Profile } from '../../../lib/types';

type Context = ServerLoadContext<{ username: string }>;

export async function load(ctx: Context): Promise<Profile> {
  return (await api(ctx, `profiles/${encodeURIComponent(ctx.params.username)}`)).profile;
}

// layout 的 action 对其中的页面（文章、收藏）都有效，表单提交到当前页面的 `?/toggleFollow`
export const actions = {
  toggleFollow: async (ctx: Context) => {
    const form = await ctx.request.formData();
    const path = `profiles/${encodeURIComponent(ctx.params.username)}/follow`;
    await api(ctx, path, form.get('following') ? 'DELETE' : 'POST');
  },
};
