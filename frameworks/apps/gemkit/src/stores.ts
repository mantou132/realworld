import type { User } from './lib/types';

/** 根 layout 的数据写入这个 store，服务端渲染时的值会同步到客户端 */
export const userStore = createStore<{ user: User | null }>({ user: null });
