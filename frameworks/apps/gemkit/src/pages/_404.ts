import { page } from '@mantou/gemkit';

@page('Not found')
export default class NotFoundPage extends GemElement {
  @template()
  #content = () => html`<div class="container page"><h1>Not found!</h1></div>`;
}
