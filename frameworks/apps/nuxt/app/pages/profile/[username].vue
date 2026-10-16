<script setup lang="ts">
import { avatar, type Profile } from '~/types';

const route = useRoute();
const api = useApi();
const user = useUser();
const username = computed(() => String(route.params.username));

const { data: profile } = await useAsyncData(
  () => `profile:${username.value}`,
  () => api<{ profile: Profile }>(`/profiles/${encodeURIComponent(username.value)}`).then((res) => res.profile),
);
if (!profile.value) throw createError({ statusCode: 404, statusMessage: 'Not found' });
useHead({ title: () => `@${username.value} — Conduit` });

const favorites = computed(() => route.path.endsWith('/favorites'));

async function toggleFollow() {
  const result = await api<{ profile: Profile }>(`/profiles/${username.value}/follow`, {
    method: profile.value!.following ? 'DELETE' : 'POST',
  });
  profile.value = result.profile;
}
</script>

<template>
  <div v-if="profile" class="profile-page">
    <div class="user-info">
      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <img :src="avatar(profile.image)" class="user-img" :alt="profile.username" />
            <h4>{{ profile.username }}</h4>
            <p>{{ profile.bio ?? '' }}</p>
            <NuxtLink
              v-if="user?.username === profile.username"
              to="/settings"
              class="btn btn-sm btn-outline-secondary action-btn"
            >
              <i class="ion-gear-a"></i> Edit Profile Settings
            </NuxtLink>
            <button
              v-else-if="user"
              :class="['btn', 'btn-sm', 'action-btn', profile.following ? 'btn-secondary' : 'btn-outline-secondary']"
              @click="toggleFollow"
            >
              <i class="ion-plus-round"></i> {{ profile.following ? 'Unfollow' : 'Follow' }} {{ profile.username }}
            </button>
            <NuxtLink v-else to="/login">Sign in to follow</NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-10 offset-md-1">
          <div class="articles-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item">
                <NuxtLink :to="`/profile/${profile.username}`" :class="['nav-link', { active: !favorites }]">My Articles</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink :to="`/profile/${profile.username}/favorites`" :class="['nav-link', { active: favorites }]">
                  Favorited Articles
                </NuxtLink>
              </li>
            </ul>
          </div>
          <NuxtPage />
        </div>
      </div>
    </div>
  </div>
</template>
