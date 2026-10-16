import { page } from '@mantou/gemkit';

import { enhance } from '../../lib/form';
import { type Article, avatar, type Comment, formatDate } from '../../lib/types';
import { userStore } from '../../stores';
import type { ArticleData } from './[slug].server';

const style = css`
  .article-meta form {
    display: inline;
  }
  .mod-options form {
    display: inline;
  }
  .mod-options button {
    all: unset;
    cursor: pointer;
  }
`;

@page<{ slug: string }, ArticleData>({ title: (_, data) => data.article.title })
@adoptedStyle(style)
@connectStore(userStore)
export default class ArticlePage extends GemElement {
  @property data: ArticleData;

  #meta = (article: Article) => {
    const { user } = userStore;
    const { author } = article;
    const own = user?.username === author.username;
    return html`
      <div class="article-meta">
        <a href=${`/profile/${author.username}`}><img src=${avatar(author.image)} alt=${author.username} /></a>
        <div class="info">
          <a href=${`/profile/${author.username}`} class="author">${author.username}</a>
          <span class="date">${formatDate(article.createdAt)}</span>
        </div>
        <span v-if=${own}>
          <a href=${`/editor/${article.slug}`} class="btn btn-outline-secondary btn-sm">
            <i class="ion-edit"></i> Edit Article
          </a>
          <form method="post" action="?/deleteArticle" @submit=${enhance()}>
            <button class="btn btn-outline-danger btn-sm"><i class="ion-trash-a"></i> Delete Article</button>
          </form>
        </span>
        <span v-else-if=${!!user}>
          <form method="post" action="?/toggleFollow" @submit=${enhance()}>
            <input type="hidden" name="username" value=${author.username} />
            <input type="hidden" name="following" value=${author.following ? 'on' : ''} />
            <button class=${classMap({
              btn: true,
              'btn-sm': true,
              'btn-secondary': author.following,
              'btn-outline-secondary': !author.following,
            })}>
              <i class="ion-plus-round"></i> ${author.following ? 'Unfollow' : 'Follow'} ${author.username}
            </button>
          </form>
          <form method="post" action="?/toggleFavorite" @submit=${enhance()}>
            <input type="hidden" name="favorited" value=${article.favorited ? 'on' : ''} />
            <button class=${classMap({
              btn: true,
              'btn-sm': true,
              'btn-primary': article.favorited,
              'btn-outline-primary': !article.favorited,
            })}>
              <i class="ion-heart"></i> ${article.favorited ? 'Unfavorite' : 'Favorite'} Article
              <span class="counter">(${article.favoritesCount})</span>
            </button>
          </form>
        </span>
      </div>
    `;
  };

  #comment = (comment: Comment) => html`
    <div class="card">
      <div class="card-block"><p class="card-text">${comment.body}</p></div>
      <div class="card-footer">
        <a href=${`/profile/${comment.author.username}`} class="comment-author">
          <img src=${avatar(comment.author.image)} class="comment-author-img" alt=${comment.author.username} />
        </a>
        &nbsp;
        <a href=${`/profile/${comment.author.username}`} class="comment-author">${comment.author.username}</a>
        <span class="date-posted">${formatDate(comment.createdAt)}</span>
        <span v-if=${userStore.user?.username === comment.author.username} class="mod-options">
          <form method="post" action="?/deleteComment" @submit=${enhance()}>
            <input type="hidden" name="id" value=${comment.id} />
            <button aria-label="Delete comment"><i class="ion-trash-a"></i></button>
          </form>
        </span>
      </div>
    </div>
  `;

  #resetComment = (evt: SubmitEvent) => {
    const form = evt.target as HTMLFormElement;
    return enhance(() => form.reset())(evt);
  };

  @template()
  #content = () => {
    const { article, comments } = this.data;
    const { user } = userStore;
    return html`
      <div class="article-page">
        <div class="banner">
          <div class="container">
            <h1>${article.title}</h1>
            ${this.#meta(article)}
          </div>
        </div>
        <div class="container page">
          <div class="row article-content">
            <div class="col-xs-12">
              <app-html .content=${article.body}></app-html>
              <ul class="tag-list">
                ${article.tagList.map((tag) => html`<li class="tag-default tag-pill tag-outline">${tag}</li>`)}
              </ul>
            </div>
          </div>
          <hr />
          <div class="article-actions">${this.#meta(article)}</div>
          <div class="row">
            <div class="col-xs-12 col-md-8 offset-md-2">
              <form v-if=${!!user} class="card comment-form" method="post" action="?/createComment" @submit=${this.#resetComment}>
                <div class="card-block">
                  <textarea class="form-control" name="comment" placeholder="Write a comment..." rows="3"></textarea>
                </div>
                <div class="card-footer">
                  <img src=${avatar(user?.image ?? null)} class="comment-author-img" alt=${user?.username} />
                  <button class="btn btn-sm btn-primary" type="submit">Post Comment</button>
                </div>
              </form>
              <p v-else>
                <a href="/login">Sign in</a> or <a href="/register">sign up</a> to add comments on this article.
              </p>
              ${comments.map(this.#comment)}
            </div>
          </div>
        </div>
      </div>
    `;
  };
}
