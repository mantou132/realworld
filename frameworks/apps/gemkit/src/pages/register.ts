@page('Sign up')
export default class RegisterPage extends GemElement {
  @template()
  #content = () => html`<app-auth-form register></app-auth-form>`;
}
