import { enhance } from '../lib/form';
import type { Errors } from '../lib/types';

/** 登录和注册页面共用的表单 */
@customElement('app-auth-form')
export class AppAuthFormElement extends GemElement {
  @boolattribute register: boolean;

  #state = createState({ errors: undefined as Errors | undefined });

  #submit = enhance<{ errors?: Errors }>((result) => this.#state({ errors: result?.errors }));

  #input = (name: string, type: string, placeholder: string) =>
    html`<fieldset class="form-group">
      <input class="form-control form-control-lg" name=${name} type=${type} required placeholder=${placeholder} />
    </fieldset>`;

  @template()
  #content = () => html`
    <div class="auth-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">${this.register ? 'Sign up' : 'Sign in'}</h1>
            <p class="text-xs-center">
              ${this.register ? html`<a href="/login">Have an account?</a>` : html`<a href="/register">Need an account?</a>`}
            </p>
            <app-list-errors .errors=${this.#state.errors}></app-list-errors>
            <form method="post" action=${this.register ? '?/register' : '?/login'} @submit=${this.#submit}>
              ${this.register ? this.#input('username', 'text', 'Username') : ''}
              ${this.#input('email', 'email', 'Email')} ${this.#input('password', 'password', 'Password')}
              <button class="btn btn-lg btn-primary pull-xs-right" type="submit">
                ${this.register ? 'Sign up' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}
