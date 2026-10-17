import type { ServerLoadContext } from '@mantou/gemkit';

import { authenticate } from '../lib/auth.server';

export const actions = { register: (ctx: ServerLoadContext) => authenticate(ctx, 'users') };
