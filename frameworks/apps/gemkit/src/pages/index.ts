import { history } from '@mantou/gem';
import { page } from '@mantou/gemkit';

import { home } from '../lib/home';
import type { HomeData } from '../lib/home.server';
import { userStore } from '../stores';

@page('Home')
@connectStore(history.store)
@connectStore(userStore)
export default class HomePage extends GemElement {
  @property data: HomeData;

  @template()
  #content = () => home(this.data);
}
