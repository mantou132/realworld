import { history } from '@mantou/gem';
import { page } from '@mantou/gemkit';

import { articleList } from '../../../lib/article-list';
import type { ArticleListData } from '../../../lib/types';
import { userStore } from '../../../stores';

@page<{ username: string }>({ title: ({ username }) => `Articles favorited by @${username}` })
@connectStore(history.store)
@connectStore(userStore)
export default class FavoritesPage extends GemElement {
  @property data: ArticleListData;

  @template()
  #content = () => articleList(this.data);
}
