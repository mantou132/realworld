<script setup lang="ts">
import { avatar } from '~/types';

const user = useUser();
const route = useRoute();
const linkClass = (path: string) => ['nav-link', { active: route.path === path }];
</script>

<template>
  <nav class="navbar navbar-light">
    <div class="container">
      <NuxtLink class="navbar-brand" to="/"><img src="/conduit-logo.svg" alt="Conduit" class="navbar-logo" /></NuxtLink>
      <ul class="nav navbar-nav pull-xs-right">
        <li class="nav-item"><NuxtLink :class="linkClass('/')" to="/">Home</NuxtLink></li>
        <template v-if="user">
          <li class="nav-item">
            <NuxtLink :class="linkClass('/editor')" to="/editor"><i class="ion-compose"></i>&nbsp;New Article</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink :class="linkClass('/settings')" to="/settings"><i class="ion-gear-a"></i>&nbsp;Settings</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink :class="linkClass(`/profile/${user.username}`)" :to="`/profile/${user.username}`">
              <img class="user-pic" :src="avatar(user.image)" :alt="user.username" />{{ user.username }}
            </NuxtLink>
          </li>
        </template>
        <template v-else>
          <li class="nav-item"><NuxtLink :class="linkClass('/login')" to="/login">Sign in</NuxtLink></li>
          <li class="nav-item"><NuxtLink :class="linkClass('/register')" to="/register">Sign up</NuxtLink></li>
        </template>
      </ul>
    </div>
  </nav>
</template>
