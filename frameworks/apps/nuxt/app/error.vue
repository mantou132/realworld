<script setup lang="ts">
defineProps<{ error: { statusCode: number } }>();
</script>

<template>
  <AppNav />
  <div class="container page">
    <h1>{{ error.statusCode === 404 ? 'Not found!' : 'Something went wrong' }}</h1>
  </div>
</template>
