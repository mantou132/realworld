import type { ServerLoadContext } from '@mantou/gemkit';

import { api, formString } from './api.server';

/** 发布和更新文章，`slug` 为空时新建 */
export async function saveArticle(ctx: ServerLoadContext, slug?: string) {
  const form = await ctx.request.formData();
  const article = {
    title: formString(form, 'title'),
    description: formString(form, 'description'),
    body: formString(form, 'body'),
    tagList: form.getAll('tag').map(String),
  };
  const result = await api(ctx, slug ? `articles/${slug}` : 'articles', slug ? 'PUT' : 'POST', { article });
  if (result.errors) return { errors: result.errors };
  redirect(303, `/article/${result.article.slug}`);
}
