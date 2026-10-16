<script setup lang="ts">
import { type Article, avatar, formatDate, PAGE_SIZE } from '~/types';

const props = defineProps<{ filter?: Record<string, string>; feed?: boolean }>();

const route = useRoute();
const api = useApi();
const user = useUser();
const page = computed(() => Number(route.query.page) || 1);

const { data } = await useAsyncData(
  () => `articles:${props.feed}:${JSON.stringify(props.filter)}:${page.value}`,
  () =>
    api<{ articles: Article[]; articlesCount: number }>(props.feed ? '/articles/feed' : '/articles', {
      query: { ...props.filter, limit: PAGE_SIZE, offset: (page.value - 1) * PAGE_SIZE },
    }),
  // 收藏状态会在列表中修改
  { deep: true },
);

const pages = computed(() => Math.ceil((data.value?.articlesCount ?? 0) / PAGE_SIZE));

async function toggleFavorite(article: Article) {
  const result = await api<{ article: Article }>(`/articles/${article.slug}/favorite`, {
    method: article.favorited ? 'DELETE' : 'POST',
  });
  Object.assign(article, result.article);
}
</script>

<template>
  <template v-if="data?.articles.length">
    <div v-for="article in data.articles" :key="article.slug" class="article-preview">
      <div class="article-meta">
        <NuxtLink :to="`/profile/${article.author.username}`">
          <img :src="avatar(article.author.image)" :alt="article.author.username" />
        </NuxtLink>
        <div class="info">
          <NuxtLink class="author" :to="`/profile/${article.author.username}`">{{ article.author.username }}</NuxtLink>
          <span class="date">{{ formatDate(article.createdAt) }}</span>
        </div>
        <button
          v-if="user"
          :class="['btn', 'btn-sm', 'pull-xs-right', article.favorited ? 'btn-primary' : 'btn-outline-primary']"
          @click="toggleFavorite(article)"
        >
          <i class="ion-heart"></i> {{ article.favoritesCount }}
        </button>
      </div>
      <NuxtLink :to="`/article/${article.slug}`" class="preview-link">
        <h1>{{ article.title }}</h1>
        <p>{{ article.description }}</p>
        <span>Read more...</span>
        <ul class="tag-list">
          <li v-for="tag in article.tagList" :key="tag" class="tag-default tag-pill tag-outline">{{ tag }}</li>
        </ul>
      </NuxtLink>
    </div>
  </template>
  <div v-else-if="feed" class="article-preview empty-feed-message">
    Your feed is empty. Follow some authors or browse the <NuxtLink to="/">Global Feed</NuxtLink>.
  </div>
  <div v-else class="article-preview empty-feed-message">No articles are here... yet.</div>
  <nav v-if="pages > 1">
    <ul class="pagination">
      <li v-for="n in pages" :key="n" :class="['page-item', { active: n === page }]">
        <NuxtLink class="page-link" :to="{ query: { ...route.query, page: n } }">{{ n }}</NuxtLink>
      </li>
    </ul>
  </nav>
</template>
