import { page } from '@mantou/gemkit';

import type { HomeData } from '../lib/home.server';

@page('Home')
export default class HomePage extends GemElement {
  @property data: HomeData;

  @template()
  #content = () => html`<app-home .data=${this.data}></app-home>`;
}
