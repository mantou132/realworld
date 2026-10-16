import { page } from '@mantou/gemkit';

import type { HomeData } from '../../lib/home.server';

@page<{ tag: string }>({ title: ({ tag }) => `#${tag}` })
export default class TagPage extends GemElement {
  @property params: { tag: string };
  @property data: HomeData;

  @template()
  #content = () => html`<app-home .data=${this.data} .tag=${this.params.tag}></app-home>`;
}
