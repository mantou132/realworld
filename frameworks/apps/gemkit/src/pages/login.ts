@page('Sign in')
export default class LoginPage extends GemElement {
  @template()
  #content = () => html`<app-auth-form></app-auth-form>`;
}
