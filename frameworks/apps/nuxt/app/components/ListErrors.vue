<script setup lang="ts">
import type { Errors } from '~/types';

defineProps<{ errors?: Errors }>();
</script>

<template>
  <ul v-if="errors" class="error-messages">
    <li v-for="(messages, key) in errors" :key="key">{{ key }} {{ [messages].flat().join(', ') }}</li>
  </ul>
</template>
