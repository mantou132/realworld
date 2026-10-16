<script setup lang="ts">
const props = defineProps<{ tag?: string }>();

const route = useRoute();
const user = useUser();
const api = useApi();
const feed = computed(() => !props.tag && route.query.feed === 'following');
if (feed.value && !user.value) await navigateTo('/login');

const { data: tags } = await useAsyncData('tags', () => api<{ tags: string[] }>('/tags').then((res) => res.tags));
</script>

<template>
  <div class="home-page">
    <div v-if="!user" class="banner">
      <div class="container">
        <h1 class="logo-font"><img src="/conduit-logo.svg" alt="Conduit" class="banner-logo" /></h1>
        <p>A place to share your knowledge.</p>
      </div>
    </div>
    <div class="container page">
      <div class="row">
        <div class="col-md-9">
          <div class="feed-toggle">
            <ul class="nav nav-pills outline-active">
              <li v-if="user" class="nav-item">
                <NuxtLink to="/?feed=following" :class="['nav-link', { active: feed }]">Your Feed</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/" :class="['nav-link', { active: !tag && !feed }]">Global Feed</NuxtLink>
              </li>
              <li v-if="tag" class="nav-item">
                <NuxtLink :to="`/tag/${tag}`" class="nav-link active"><i class="ion-pound"></i> {{ tag }}</NuxtLink>
              </li>
            </ul>
          </div>
          <ArticleList :filter="tag ? { tag } : {}" :feed="feed" />
        </div>
        <div class="col-md-3">
          <div class="sidebar">
            <p>Popular Tags</p>
            <div class="tag-list">
              <NuxtLink v-for="t in tags" :key="t" :to="`/tag/${t}`" class="tag-default tag-pill">{{ t }}</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
