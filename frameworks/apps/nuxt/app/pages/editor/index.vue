<script setup lang="ts">
definePageMeta({ middleware: 'auth' });
useHead({ title: 'Editor — Conduit' });
</script>

<template>
  <ArticleEditor />
</template>
