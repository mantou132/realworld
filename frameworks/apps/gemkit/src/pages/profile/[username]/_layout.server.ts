import type { ServerLoadContext } from '@mantou/gemkit';

import { api } from '../../../lib/api.server';
import type { Profile } from '../../../lib/types';

export async function load(ctx: ServerLoadContext<{ username: string }>): Promise<Profile> {
  return (await api(ctx, `profiles/${encodeURIComponent(ctx.params.username)}`)).profile;
}
