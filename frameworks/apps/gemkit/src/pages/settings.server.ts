import { redirect, type ServerLoadContext } from '@mantou/gemkit';

import { api, formString, requireUser, setUser } from '../lib/api.server';

export function load(ctx: ServerLoadContext) {
  requireUser(ctx);
}

export const actions = {
  save: async (ctx: ServerLoadContext) => {
    requireUser(ctx);
    const form = await ctx.request.formData();
    const password = formString(form, 'password');
    const user = {
      image: formString(form, 'image') || null,
      username: formString(form, 'username'),
      bio: formString(form, 'bio'),
      email: formString(form, 'email'),
      ...(password && { password }),
    };
    const result = await api(ctx, 'user', 'PUT', { user });
    if (result.errors) return { errors: result.errors };
    setUser(ctx, result.user);
    redirect(303, `/profile/${result.user.username}`);
  },
  logout: (ctx: ServerLoadContext) => {
    ctx.cookies.delete('jwt');
    redirect(303, '/');
  },
};
