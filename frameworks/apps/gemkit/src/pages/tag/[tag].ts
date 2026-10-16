import { history } from '@mantou/gem';
import { page } from '@mantou/gemkit';

import { home } from '../../lib/home';
import type { HomeData } from '../../lib/home.server';
import { userStore } from '../../stores';

@page<{ tag: string }>({ title: ({ tag }) => `#${tag}` })
@connectStore(history.store)
@connectStore(userStore)
export default class TagPage extends GemElement {
  @property params: { tag: string };
  @property data: HomeData;

  @template()
  #content = () => home(this.data, this.params.tag);
}
