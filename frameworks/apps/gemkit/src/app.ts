import { history } from '@mantou/gem';
import { isServer } from '@mantou/gem/lib/server';

import { userStore } from './stores';

declare global {
  interface Window {
    __conduit_debug__: unknown;
  }
}

if (!isServer) {
  // 普通 `<a>` 使用客户端导航，主题样式直接作用于 `<a>`，不需要 `<gem-link>`
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const link = (event.target as Element).closest('a');
    if (!link || link.target || link.origin !== location.origin) return;
    event.preventDefault();
    history.push({ path: link.pathname, query: link.search, hash: link.hash });
  });

  // token 在 httpOnly cookie 中，客户端不可见
  window.__conduit_debug__ = {
    getToken: () => null,
    getAuthState: () => (userStore.user ? 'authenticated' : 'unauthenticated'),
    getCurrentUser: () => userStore.user,
  };
}
