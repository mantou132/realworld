import type { ServerLoadContext } from '@mantou/gemkit';

import { loadHome } from '../lib/home.server';

export const load = (ctx: ServerLoadContext) => loadHome(ctx);
