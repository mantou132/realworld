<script setup lang="ts">
import type { Article } from '~/types';

definePageMeta({ middleware: 'auth' });
useHead({ title: 'Editor — Conduit' });

const route = useRoute();
const api = useApi();
const { data } = await useAsyncData(`editor:${route.params.slug}`, () =>
  api<{ article: Article }>(`/articles/${route.params.slug}`).then((res) => res.article),
);
</script>

<template>
  <ArticleEditor v-if="data" :article="data" />
</template>
