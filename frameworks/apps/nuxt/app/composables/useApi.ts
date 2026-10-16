import { FetchError } from 'ofetch';

import type { Errors, User } from '~/types';

export const useToken = () => useCookie<string | null>('jwt', { sameSite: 'lax' });

export const useUser = () => useState<User | null>('user', () => null);

/** 服务端和客户端都直接请求 API，token 来自 cookie */
export function useApi() {
  const token = useToken();
  const { apiBase } = useRuntimeConfig().public;
  return <T = any>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: Record<string, unknown>;
      query?: Record<string, string | number>;
    } = {},
  ) =>
    $fetch<T>(path, {
      baseURL: apiBase,
      method: options.method,
      body: options.body,
      query: options.query,
      headers: token.value ? { Authorization: `Token ${token.value}` } : {},
    });
}

/** 422 等错误返回 `errors`，其他错误抛出 */
export async function withErrors(action: () => Promise<unknown>): Promise<Errors | undefined> {
  try {
    await action();
  } catch (err) {
    if (err instanceof FetchError && err.data?.errors) return err.data.errors;
    throw err;
  }
}
