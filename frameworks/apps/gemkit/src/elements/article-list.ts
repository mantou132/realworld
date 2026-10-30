import { history } from '@mantou/gem';

import { userStore } from '../stores';
import { type Article, type ArticleListData, avatar, formatDate } from '../lib/types';
import type { actions } from '../pages/_layout.server';

const pageLink = (page: number) => {
  const { path, query } = history.getParams();
  const params = new URLSearchParams(String(query));
  params.set('page', `${page}`);
  return `${path}?${params}`;
};

// 根 layout 的 action，文章列表所在的每个页面都可以提交
const { toggleFavorite } = formActions<typeof actions>();

const preview = (article: Article) => html`
  <div class="article-preview">
    <div class="article-meta">
      <a href=${`/profile/${article.author.username}`}>
        <img src=${avatar(article.author.image)} alt=${article.author.username} />
      </a>
      <div class="info">
        <a class="author" href=${`/profile/${article.author.username}`}>${article.author.username}</a>
        <span class="date">${formatDate(article.createdAt)}</span>
      </div>
      <form v-if=${!!userStore.user} class="pull-xs-right" ${toggleFavorite()}>
        <input type="hidden" name="slug" value=${article.slug} />
        <input type="hidden" name="favorited" value=${article.favorited ? 'on' : ''} />
        <button
          class=${classMap({
            btn: true,
            'btn-sm': true,
            'btn-primary': article.favorited,
            'btn-outline-primary': !article.favorited,
          })}
        >
          <i class="ion-heart"></i> ${article.favoritesCount}
        </button>
      </form>
    </div>
    <a href=${`/article/${article.slug}`} class="preview-link">
      <h1>${article.title}</h1>
      <p>${article.description}</p>
      <span>Read more...</span>
      <ul class="tag-list">
        ${article.tagList.map((tag) => html`<li class="tag-default tag-pill tag-outline">${tag}</li>`)}
      </ul>
    </a>
  </div>
`;

@customElement('app-article-list')
@connectStore(history.store)
@connectStore(userStore)
export class AppArticleListElement extends GemElement {
  @property data: ArticleListData;
  @property empty?: unknown;

  @template()
  #content = () => {
    const { articles, pages } = this.data;
    const empty = this.empty ?? 'No articles are here... yet.';
    const current = Number(new URLSearchParams(String(history.getParams().query)).get('page')) || 1;
    return html`
      ${articles.map(preview)}
      <div v-if=${!articles.length} class="article-preview empty-feed-message">${empty}</div>
      <nav v-if=${pages > 1}>
        <ul class="pagination">
          ${Array.from(
            { length: pages },
            (_, i) =>
              html`<li class=${classMap({ 'page-item': true, active: i + 1 === current })}>
                <a class="page-link" href=${pageLink(i + 1)}>${i + 1}</a>
              </li>`,
          )}
        </ul>
      </nav>
    `;
  };
}
