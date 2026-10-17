import type { ServerLoadContext } from '@mantou/gemkit';

import { api } from '../../lib/api.server';
import { saveArticle } from '../../lib/editor.server';
import type { Article } from '../../lib/types';

type Context = ServerLoadContext<{ slug: string }>;

export async function load(ctx: Context): Promise<Article> {
  return (await api(ctx, `articles/${ctx.params.slug}`)).article;
}

export const actions = { save: (ctx: Context) => saveArticle(ctx, ctx.params.slug) };
