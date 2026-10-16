import { history } from '@mantou/gem';
import { layout } from '@mantou/gemkit';

import { enhance } from '../../../lib/form';
import { avatar, type Profile } from '../../../lib/types';
import { userStore } from '../../../stores';

@layout()
@connectStore(history.store)
@connectStore(userStore)
export default class ProfileLayout extends GemElement {
  @property data: Profile;

  #actions = (profile: Profile) => {
    const { user } = userStore;
    if (user?.username === profile.username) {
      return html`<a href="/settings" class="btn btn-sm btn-outline-secondary action-btn">
        <i class="ion-gear-a"></i> Edit Profile Settings
      </a>`;
    }
    if (!user) return html`<a href="/login">Sign in to follow</a>`;
    return html`<form method="post" action=${`/profile/${profile.username}?/toggleFollow`} @submit=${enhance()}>
      <input type="hidden" name="following" value=${profile.following ? 'on' : ''} />
      <button class=${classMap({
        btn: true,
        'btn-sm': true,
        'action-btn': true,
        'btn-secondary': profile.following,
        'btn-outline-secondary': !profile.following,
      })}>
        <i class="ion-plus-round"></i> ${profile.following ? 'Unfollow' : 'Follow'} ${profile.username}
      </button>
    </form>`;
  };

  @template()
  #content = () => {
    const profile = this.data;
    const favorites = history.getParams().path.endsWith('/favorites');
    return html`
      <div class="profile-page">
        <div class="user-info">
          <div class="container">
            <div class="row">
              <div class="col-xs-12 col-md-10 offset-md-1">
                <img src=${avatar(profile.image)} class="user-img" alt=${profile.username} />
                <h4>${profile.username}</h4>
                <p>${profile.bio ?? ''}</p>
                ${this.#actions(profile)}
              </div>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="row">
            <div class="col-xs-12 col-md-10 offset-md-1">
              <div class="articles-toggle">
                <ul class="nav nav-pills outline-active">
                  <li class="nav-item">
                    <a href=${`/profile/${profile.username}`} class=${classMap({ 'nav-link': true, active: !favorites })}>My Articles</a>
                  </li>
                  <li class="nav-item">
                    <a href=${`/profile/${profile.username}/favorites`} class=${classMap({ 'nav-link': true, active: favorites })}>Favorited Articles</a>
                  </li>
                </ul>
              </div>
              <gemkit-outlet></gemkit-outlet>
            </div>
          </div>
        </div>
      </div>
    `;
  };
}
