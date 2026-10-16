import { page } from '@mantou/gemkit';

import type { ArticleListData } from '../../../lib/types';

@page<{ username: string }>({ title: ({ username }) => `Articles favorited by @${username}` })
export default class FavoritesPage extends GemElement {
  @property data: ArticleListData;

  @template()
  #content = () => html`<app-article-list .data=${this.data}></app-article-list>`;
}
