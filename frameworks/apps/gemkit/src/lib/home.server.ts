import { redirect, type ServerLoadContext } from '@mantou/gemkit';

import { api, getArticles, getUser } from './api.server';
import type { ArticleListData } from './types';

export type HomeData = ArticleListData & { tags: string[] };

export async function loadHome(ctx: ServerLoadContext, tag?: string): Promise<HomeData> {
  const feed = !tag && ctx.url.searchParams.get('feed') === 'following';
  if (feed && !getUser(ctx)) redirect(302, '/login');
  const [list, { tags }] = await Promise.all([getArticles(ctx, tag ? { tag } : {}, feed), api(ctx, 'tags')]);
  return { ...list, tags };
}
