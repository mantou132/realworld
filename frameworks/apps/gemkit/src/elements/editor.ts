import { enhance } from '../lib/form';
import type { Article, Errors } from '../lib/types';

const style = css`
  .tag-pill {
    border: none;
    cursor: pointer;
  }
`;

@customElement('app-editor')
@adoptedStyle(style)
export class AppEditorElement extends GemElement {
  @property article?: Article;

  #state = createState({ errors: undefined as Errors | undefined, tags: null as string[] | null });

  get #tags() {
    return this.#state.tags ?? this.article?.tagList ?? [];
  }

  #onKeydown = (evt: KeyboardEvent) => {
    if (evt.key !== 'Enter') return;
    evt.preventDefault();
    const input = evt.target as HTMLInputElement;
    const tag = input.value.trim();
    if (tag && !this.#tags.includes(tag)) this.#state({ tags: [...this.#tags, tag] });
    input.value = '';
  };

  #submit = enhance<{ errors?: Errors }>((result) => this.#state({ errors: result?.errors }));

  @template()
  #content = () => html`
    <div class="editor-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-10 offset-md-1 col-xs-12">
            <app-list-errors .errors=${this.#state.errors}></app-list-errors>
            <form method="post" action="?/save" @submit=${this.#submit}>
              <fieldset>
                <fieldset class="form-group">
                  <input name="title" class="form-control form-control-lg" placeholder="Article Title" value=${this.article?.title ?? ''} />
                </fieldset>
                <fieldset class="form-group">
                  <input name="description" class="form-control" placeholder="What's this article about?" value=${this.article?.description ?? ''} />
                </fieldset>
                <fieldset class="form-group">
                  <textarea
                    name="body"
                    class="form-control"
                    rows="8"
                    placeholder="Write your article (in markdown)"
                    .value=${this.article?.body ?? ''}
                  ></textarea>
                </fieldset>
                <fieldset class="form-group">
                  <input class="form-control" placeholder="Enter tags" @keydown=${this.#onKeydown} />
                  <div class="tag-list">
                    ${this.#tags.map(
                      (tag) => html`<span
                          class="tag-default tag-pill"
                          @click=${() => this.#state({ tags: this.#tags.filter((t) => t !== tag) })}
                          ><i class="ion-close-round"></i> ${tag}</span
                        ><input type="hidden" name="tag" value=${tag} />`,
                    )}
                  </div>
                </fieldset>
                <button class="btn btn-lg pull-xs-right btn-primary" type="submit">Publish Article</button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}
