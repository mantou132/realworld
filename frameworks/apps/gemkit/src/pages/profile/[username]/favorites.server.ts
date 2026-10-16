import type { ServerLoadContext } from '@mantou/gemkit';

import { getArticles } from '../../../lib/api.server';

export const load = (ctx: ServerLoadContext<{ username: string }>) =>
  getArticles(ctx, { favorited: ctx.params.username });
