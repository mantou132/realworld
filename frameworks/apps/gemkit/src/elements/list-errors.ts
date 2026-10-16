import type { Errors } from '../lib/types';

@customElement('app-list-errors')
export class AppListErrorsElement extends GemElement {
  @property errors?: Errors;

  @template()
  #content = () =>
    this.errors &&
    html`<ul class="error-messages">
      ${Object.entries(this.errors).map(([key, messages]) => html`<li>${key} ${[messages].flat().join(', ')}</li>`)}
    </ul>`;
}
