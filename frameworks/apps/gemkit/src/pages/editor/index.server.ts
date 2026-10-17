import type { ServerLoadContext } from '@mantou/gemkit';

import { saveArticle } from '../../lib/editor.server';

export const actions = { save: (ctx: ServerLoadContext) => saveArticle(ctx) };
