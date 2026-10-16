<script setup lang="ts">
import { type Article, avatar, formatDate } from '~/types';

const props = defineProps<{ article: Article }>();
const emit = defineEmits<{ update: [article: Article] }>();

const user = useUser();
const api = useApi();

async function toggleFavorite() {
  const { article } = await api<{ article: Article }>(`/articles/${props.article.slug}/favorite`, {
    method: props.article.favorited ? 'DELETE' : 'POST',
  });
  emit('update', { ...props.article, favorited: article.favorited, favoritesCount: article.favoritesCount });
}

async function toggleFollow() {
  const { author } = props.article;
  const { profile } = await api(`/profiles/${author.username}/follow`, {
    method: author.following ? 'DELETE' : 'POST',
  });
  emit('update', { ...props.article, author: { ...author, following: profile.following } });
}

async function remove() {
  await api(`/articles/${props.article.slug}`, { method: 'DELETE' });
  await navigateTo('/');
}
</script>

<template>
  <div class="article-meta">
    <NuxtLink :to="`/profile/${article.author.username}`">
      <img :src="avatar(article.author.image)" :alt="article.author.username" />
    </NuxtLink>
    <div class="info">
      <NuxtLink :to="`/profile/${article.author.username}`" class="author">{{ article.author.username }}</NuxtLink>
      <span class="date">{{ formatDate(article.createdAt) }}</span>
    </div>
    <span v-if="user?.username === article.author.username">
      <NuxtLink :to="`/editor/${article.slug}`" class="btn btn-outline-secondary btn-sm">
        <i class="ion-edit"></i> Edit Article
      </NuxtLink>
      <button class="btn btn-outline-danger btn-sm" @click="remove"><i class="ion-trash-a"></i> Delete Article</button>
    </span>
    <span v-else-if="user">
      <button
        :class="['btn', 'btn-sm', article.author.following ? 'btn-secondary' : 'btn-outline-secondary']"
        @click="toggleFollow"
      >
        <i class="ion-plus-round"></i> {{ article.author.following ? 'Unfollow' : 'Follow' }} {{ article.author.username }}
      </button>
      <button :class="['btn', 'btn-sm', article.favorited ? 'btn-primary' : 'btn-outline-primary']" @click="toggleFavorite">
        <i class="ion-heart"></i> {{ article.favorited ? 'Unfavorite' : 'Favorite' }} Article
        <span class="counter">({{ article.favoritesCount }})</span>
      </button>
    </span>
  </div>
</template>
