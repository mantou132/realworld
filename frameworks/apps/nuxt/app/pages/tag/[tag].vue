<script setup lang="ts">
const route = useRoute();
const tag = computed(() => String(route.params.tag));
useHead({ title: () => `#${tag.value} — Conduit` });
</script>

<template>
  <HomeView :tag="tag" />
</template>
