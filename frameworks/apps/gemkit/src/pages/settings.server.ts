import { redirect, type ServerLoadContext } from '@mantou/gemkit';

import { api, formString, setUser } from '../lib/api.server';

export const actions = {
  save: async (ctx: ServerLoadContext) => {
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
    ctx.locals.user = undefined;
    redirect(303, '/');
  },
};
