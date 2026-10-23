import { enhance } from '../lib/form';
import type { Errors } from '../lib/types';
import { userStore } from '../stores';

@page('Settings')
@connectStore(userStore)
export default class SettingsPage extends GemElement {
  #state = createState({ errors: undefined as Errors | undefined });

  #save = enhance<{ errors?: Errors }>((result) => this.#state({ errors: result?.errors }));

  @template()
  #content = () => {
    const { user } = userStore;
    return html`
      <div class="settings-page">
        <div class="container page">
          <div class="row">
            <div class="col-md-6 offset-md-3 col-xs-12">
              <h1 class="text-xs-center">Your Settings</h1>
              <app-list-errors .errors=${this.#state.errors}></app-list-errors>
              <form method="post" action="?/save" @submit=${this.#save}>
                <fieldset>
                  <fieldset class="form-group">
                    <input class="form-control" name="image" type="text" placeholder="URL of profile picture" value=${user?.image ?? ''} />
                  </fieldset>
                  <fieldset class="form-group">
                    <input class="form-control form-control-lg" name="username" type="text" placeholder="Your Name" value=${user?.username ?? ''} />
                  </fieldset>
                  <fieldset class="form-group">
                    <textarea
                      class="form-control form-control-lg"
                      name="bio"
                      rows="8"
                      placeholder="Short bio about you"
                      .value=${user?.bio ?? ''}
                    ></textarea>
                  </fieldset>
                  <fieldset class="form-group">
                    <input class="form-control form-control-lg" name="email" type="email" placeholder="Email" value=${user?.email ?? ''} />
                  </fieldset>
                  <fieldset class="form-group">
                    <input class="form-control form-control-lg" name="password" type="password" placeholder="New Password" />
                  </fieldset>
                  <button class="btn btn-lg btn-primary pull-xs-right" type="submit">Update Settings</button>
                </fieldset>
              </form>
              <hr />
              <form method="post" action="?/logout" @submit=${enhance()}>
                <button class="btn btn-outline-danger" type="submit">Or click here to logout.</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  };
}
