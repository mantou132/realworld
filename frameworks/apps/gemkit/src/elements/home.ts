import { history } from '@mantou/gem';

import { userStore } from '../stores';
import type { HomeData } from '../lib/home.server';

/** 首页和标签页共用 */
@customElement('app-home')
@connectStore(history.store)
@connectStore(userStore)
export class AppHomeElement extends GemElement {
  @property data: HomeData;
  @property tag?: string;

  @template()
  #content = () => {
    const { data, tag } = this;
    const { user } = userStore;
    const feed = !tag && !!user && new URLSearchParams(String(history.getParams().query)).get('feed') === 'following';
    const empty = feed
      ? html`Your feed is empty. Follow some authors or browse the <a href="/">Global Feed</a>.`
      : undefined;
    return html`
      <div class="home-page">
        <div class="banner" v-if=${!user}>
          <div class="container">
            <h1 class="logo-font"><img src="/conduit-logo.svg" alt="Conduit" class="banner-logo" /></h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>
        <div class="container page">
          <div class="row">
            <div class="col-md-9">
              <div class="feed-toggle">
                <ul class="nav nav-pills outline-active">
                  <li class="nav-item" v-if=${!!user}>
                    <a href="/?feed=following" class=${classMap({ 'nav-link': true, active: feed })}>Your Feed</a>
                  </li>
                  <li class="nav-item">
                    <a href="/" class=${classMap({ 'nav-link': true, active: !tag && !feed })}>Global Feed</a>
                  </li>
                  <li class="nav-item" v-if=${!!tag}>
                    <a href=${`/tag/${tag}`} class="nav-link active"><i class="ion-pound"></i> ${tag}</a>
                  </li>
                </ul>
              </div>
              <app-article-list .data=${data} .empty=${empty}></app-article-list>
            </div>
            <div class="col-md-3">
              <div class="sidebar">
                <p>Popular Tags</p>
                <div class="tag-list">
                  ${data.tags.map((t) => html`<a href=${`/tag/${t}`} class="tag-default tag-pill">${t}</a>`)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };
}
