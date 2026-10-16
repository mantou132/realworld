import type { User } from '~/types';

// 服务端用 cookie 中的 token 获取当前用户，状态会传给客户端
export default defineNuxtPlugin(async () => {
  const token = useToken();
  const user = useUser();
  if (!import.meta.server || !token.value) return;
  try {
    user.value = (await useApi()<{ user: User }>('/user')).user;
  } catch {
    token.value = null;
  }
});
