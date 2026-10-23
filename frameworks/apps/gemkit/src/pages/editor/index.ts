@page('Editor')
export default class NewArticlePage extends GemElement {
  @template()
  #content = () => html`<app-editor></app-editor>`;
}
