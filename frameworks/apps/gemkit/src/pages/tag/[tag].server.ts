import type { ServerLoadContext } from '@mantou/gemkit';

import { loadHome } from '../../lib/home.server';

export const load = (ctx: ServerLoadContext<{ tag: string }>) => loadHome(ctx, ctx.params.tag);
