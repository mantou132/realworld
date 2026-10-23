import type { ServerLoadContext } from '@mantou/gemkit';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

import { api, formString } from '../../lib/api.server';
import type { Article, Comment } from '../../lib/types';

type Context = ServerLoadContext<{ slug: string }>;

export interface ArticleData {
  article: Article;
  comments: Comment[];
}

// markdown 在服务端转换，`marked` 和 `sanitize-html` 不会打包到客户端
export async function load(ctx: Context): Promise<ArticleData> {
  const [{ article }, { comments }] = await Promise.all([
    api(ctx, `articles/${ctx.params.slug}`),
    api(ctx, `articles/${ctx.params.slug}/comments`),
  ]);
  return { article: { ...article, body: sanitizeHtml(await marked(article.body)) }, comments };
}

export const actions = {
  createComment: async (ctx: Context) => {
    const form = await ctx.request.formData();
    return api(ctx, `articles/${ctx.params.slug}/comments`, 'POST', { comment: { body: formString(form, 'comment') } });
  },
  deleteComment: async (ctx: Context) => {
    const form = await ctx.request.formData();
    await api(ctx, `articles/${ctx.params.slug}/comments/${formString(form, 'id')}`, 'DELETE');
  },
  deleteArticle: async (ctx: Context) => {
    await api(ctx, `articles/${ctx.params.slug}`, 'DELETE');
    redirect(303, '/');
  },
  toggleFavorite: async (ctx: Context) => {
    const form = await ctx.request.formData();
    await api(ctx, `articles/${ctx.params.slug}/favorite`, form.get('favorited') ? 'DELETE' : 'POST');
  },
  toggleFollow: async (ctx: Context) => {
    const form = await ctx.request.formData();
    await api(ctx, `profiles/${formString(form, 'username')}/follow`, form.get('following') ? 'DELETE' : 'POST');
  },
};
