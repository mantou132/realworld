<script setup lang="ts">
import { type Article, avatar, type Comment, formatDate } from '~/types';

const route = useRoute();
const user = useUser();
const api = useApi();
const slug = String(route.params.slug);

// 评论和收藏状态会在页面中修改
const { data } = await useFetch<{ article: Article; comments: Comment[] }>(`/api/articles/${slug}`, { deep: true });
if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Not found' });
useHead({ title: () => `${data.value?.article.title} — Conduit` });

const comment = ref('');

async function postComment() {
  const result = await api<{ comment: Comment }>(`/articles/${slug}/comments`, {
    method: 'POST',
    body: { comment: { body: comment.value } },
  });
  data.value!.comments.unshift(result.comment);
  comment.value = '';
}

async function deleteComment(id: number) {
  await api(`/articles/${slug}/comments/${id}`, { method: 'DELETE' });
  data.value!.comments = data.value!.comments.filter((c) => c.id !== id);
}

const update = (article: Article) => (data.value!.article = article);
</script>

<template>
  <div v-if="data" class="article-page">
    <div class="banner">
      <div class="container">
        <h1>{{ data.article.title }}</h1>
        <ArticleMeta :article="data.article" @update="update" />
      </div>
    </div>
    <div class="container page">
      <div class="row article-content">
        <div class="col-xs-12">
          <div v-html="data.article.body"></div>
          <ul class="tag-list">
            <li v-for="tag in data.article.tagList" :key="tag" class="tag-default tag-pill tag-outline">{{ tag }}</li>
          </ul>
        </div>
      </div>
      <hr />
      <div class="article-actions"><ArticleMeta :article="data.article" @update="update" /></div>
      <div class="row">
        <div class="col-xs-12 col-md-8 offset-md-2">
          <form v-if="user" class="card comment-form" @submit.prevent="postComment">
            <div class="card-block">
              <textarea v-model="comment" class="form-control" placeholder="Write a comment..." rows="3"></textarea>
            </div>
            <div class="card-footer">
              <img :src="avatar(user.image)" class="comment-author-img" :alt="user.username" />
              <button class="btn btn-sm btn-primary" type="submit">Post Comment</button>
            </div>
          </form>
          <p v-else>
            <NuxtLink to="/login">Sign in</NuxtLink> or <NuxtLink to="/register">sign up</NuxtLink> to add comments on
            this article.
          </p>
          <div v-for="c in data.comments" :key="c.id" class="card">
            <div class="card-block"><p class="card-text">{{ c.body }}</p></div>
            <div class="card-footer">
              <NuxtLink :to="`/profile/${c.author.username}`" class="comment-author">
                <img :src="avatar(c.author.image)" class="comment-author-img" :alt="c.author.username" />
              </NuxtLink>
              &nbsp;
              <NuxtLink :to="`/profile/${c.author.username}`" class="comment-author">{{ c.author.username }}</NuxtLink>
              <span class="date-posted">{{ formatDate(c.createdAt) }}</span>
              <span v-if="user?.username === c.author.username" class="mod-options">
                <i class="ion-trash-a" @click="deleteComment(c.id)"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
