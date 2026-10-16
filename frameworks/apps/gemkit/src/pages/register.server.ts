import type { ServerLoadContext } from '@mantou/gemkit';

import { authenticate, redirectIfSignedIn } from '../lib/auth.server';

export const load = redirectIfSignedIn;

export const actions = { register: (ctx: ServerLoadContext) => authenticate(ctx, 'users') };
