<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <ArticleList :filter="{ author: String(route.params.username) }" />
</template>
