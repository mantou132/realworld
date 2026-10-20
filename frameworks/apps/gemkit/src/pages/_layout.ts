import { history } from '@mantou/gem';
import { layout } from '@mantou/gemkit';

import { avatar, type User } from '../lib/types';
import { userStore } from '../stores';

// 服务端数据中的当前用户写入 store，导航栏和页面从 store 读取
@layout({ load: ({ data }: { data: { user: User | null } }) => userStore({ user: data.user }) })
@connectStore(history.store)
@connectStore(userStore)
export default class RootLayout extends GemElement {
  #link = (path: string, content: unknown) =>
    html`<li class="nav-item">
      <a class=${classMap({ 'nav-link': true, active: history.getParams().path === path })} href=${path}>${content}</a>
    </li>`;

  @template()
  #content = () => {
    const { user } = userStore;
    return html`
      <nav class="navbar navbar-light">
        <div class="container">
          <a class="navbar-brand" href="/"><img src="/conduit-logo.svg" alt="Conduit" class="navbar-logo" /></a>
          <ul class="nav navbar-nav pull-xs-right">
            ${this.#link('/', 'Home')}
            ${
              user
                ? [
                    this.#link('/editor', html`<i class="ion-compose"></i>&nbsp;New Article`),
                    this.#link('/settings', html`<i class="ion-gear-a"></i>&nbsp;Settings`),
                    this.#link(
                      `/profile/${user.username}`,
                      html`<img class="user-pic" src=${avatar(user.image)} alt=${user.username} />${user.username}`,
                    ),
                  ]
                : [this.#link('/login', 'Sign in'), this.#link('/register', 'Sign up')]
            }
          </ul>
        </div>
      </nav>
      <main><gemkit-outlet></gemkit-outlet></main>
    `;
  };
}
