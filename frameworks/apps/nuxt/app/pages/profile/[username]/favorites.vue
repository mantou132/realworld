<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <ArticleList :filter="{ favorited: String(route.params.username) }" />
</template>
