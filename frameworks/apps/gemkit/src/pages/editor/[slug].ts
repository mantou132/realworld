import { page } from '@mantou/gemkit';

import type { Article } from '../../lib/types';

@page('Editor')
export default class EditArticlePage extends GemElement {
  @property data?: Article;

  @template()
  #content = () => html`<app-editor .article=${this.data}></app-editor>`;
}
