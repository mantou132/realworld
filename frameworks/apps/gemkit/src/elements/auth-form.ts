import type { Errors } from '../lib/types';
import type { actions as loginActions } from '../pages/login.server';
import type { actions as registerActions } from '../pages/register.server';

const { login, register } = formActions<typeof loginActions & typeof registerActions>();

/** 登录和注册页面共用的表单 */
@customElement('app-auth-form')
export class AppAuthFormElement extends GemElement {
  @boolattribute register: boolean;

  #state = createState({ errors: undefined as Errors | undefined });

  #onResult = (result?: { errors?: Errors }) => this.#state({ errors: result?.errors });

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
            <form ${this.register ? register(this.#onResult) : login(this.#onResult)}>
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
