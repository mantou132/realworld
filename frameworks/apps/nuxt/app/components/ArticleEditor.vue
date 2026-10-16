<script setup lang="ts">
import type { Article, Errors } from '~/types';

const props = defineProps<{ article?: Article }>();

const api = useApi();
const form = reactive({
  title: props.article?.title ?? '',
  description: props.article?.description ?? '',
  body: props.article?.body ?? '',
  tagList: [...(props.article?.tagList ?? [])],
});
const tag = ref('');
const errors = ref<Errors>();

function addTag() {
  const value = tag.value.trim();
  if (value && !form.tagList.includes(value)) form.tagList.push(value);
  tag.value = '';
}

async function publish() {
  let slug = '';
  errors.value = await withErrors(async () => {
    const path = props.article ? `/articles/${props.article.slug}` : '/articles';
    const result = await api<{ article: Article }>(path, {
      method: props.article ? 'PUT' : 'POST',
      body: { article: form },
    });
    slug = result.article.slug;
  });
  if (slug) await navigateTo(`/article/${slug}`);
}
</script>

<template>
  <div class="editor-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-10 offset-md-1 col-xs-12">
          <ListErrors :errors="errors" />
          <form @submit.prevent="publish">
            <fieldset>
              <fieldset class="form-group">
                <input v-model="form.title" name="title" class="form-control form-control-lg" placeholder="Article Title" />
              </fieldset>
              <fieldset class="form-group">
                <input
                  v-model="form.description"
                  name="description"
                  class="form-control"
                  placeholder="What's this article about?"
                />
              </fieldset>
              <fieldset class="form-group">
                <textarea
                  v-model="form.body"
                  name="body"
                  class="form-control"
                  rows="8"
                  placeholder="Write your article (in markdown)"
                ></textarea>
              </fieldset>
              <fieldset class="form-group">
                <input v-model="tag" class="form-control" placeholder="Enter tags" @keydown.enter.prevent="addTag" />
                <div class="tag-list">
                  <span v-for="t in form.tagList" :key="t" class="tag-default tag-pill">
                    <i class="ion-close-round" @click="form.tagList = form.tagList.filter((x) => x !== t)"></i> {{ t }}
                  </span>
                </div>
              </fieldset>
              <button class="btn btn-lg pull-xs-right btn-primary" type="submit">Publish Article</button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
