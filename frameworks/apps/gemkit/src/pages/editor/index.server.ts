import type { ServerLoadContext } from '@mantou/gemkit';

import { requireUser } from '../../lib/api.server';
import { saveArticle } from '../../lib/editor.server';

export function load(ctx: ServerLoadContext) {
  requireUser(ctx);
}

export const actions = { save: (ctx: ServerLoadContext) => saveArticle(ctx) };
