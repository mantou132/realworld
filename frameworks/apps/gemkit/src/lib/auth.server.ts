import type { ServerLoadContext } from '@mantou/gemkit';

import { api, formString, setUser } from './api.server';

/** 登录或注册，成功后保存用户并回到首页 */
export async function authenticate(ctx: ServerLoadContext, path: 'users' | 'users/login') {
  const form = await ctx.request.formData();
  const user = {
    ...(path === 'users' && { username: formString(form, 'username') }),
    email: formString(form, 'email'),
    password: formString(form, 'password'),
  };
  const result = await api(ctx, path, 'POST', { user });
  if (result.errors) return { errors: result.errors };
  setUser(ctx, result.user);
  redirect(303, '/');
}
