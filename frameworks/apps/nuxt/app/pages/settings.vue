<script setup lang="ts">
import type { Errors, User } from '~/types';

definePageMeta({ middleware: 'auth' });
useHead({ title: 'Settings — Conduit' });

const api = useApi();
const token = useToken();
const user = useUser();
const form = reactive({
  image: user.value?.image ?? '',
  username: user.value?.username ?? '',
  bio: user.value?.bio ?? '',
  email: user.value?.email ?? '',
  password: '',
});
const errors = ref<Errors>();

async function save() {
  errors.value = await withErrors(async () => {
    const { password, ...rest } = form;
    const result = await api<{ user: User }>('/user', {
      method: 'PUT',
      body: { user: { ...rest, image: rest.image || null, ...(password && { password }) } },
    });
    token.value = result.user.token;
    user.value = result.user;
  });
  if (!errors.value) await navigateTo(`/profile/${user.value!.username}`);
}

async function logout() {
  token.value = null;
  user.value = null;
  await navigateTo('/');
}
</script>

<template>
  <div class="settings-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Your Settings</h1>
          <ListErrors :errors="errors" />
          <form @submit.prevent="save">
            <fieldset>
              <fieldset class="form-group">
                <input v-model="form.image" class="form-control" name="image" type="text" placeholder="URL of profile picture" />
              </fieldset>
              <fieldset class="form-group">
                <input v-model="form.username" class="form-control form-control-lg" name="username" type="text" placeholder="Your Name" />
              </fieldset>
              <fieldset class="form-group">
                <textarea v-model="form.bio" class="form-control form-control-lg" name="bio" rows="8" placeholder="Short bio about you"></textarea>
              </fieldset>
              <fieldset class="form-group">
                <input v-model="form.email" class="form-control form-control-lg" name="email" type="email" placeholder="Email" />
              </fieldset>
              <fieldset class="form-group">
                <input v-model="form.password" class="form-control form-control-lg" name="password" type="password" placeholder="New Password" />
              </fieldset>
              <button class="btn btn-lg btn-primary pull-xs-right" type="submit">Update Settings</button>
            </fieldset>
          </form>
          <hr />
          <button class="btn btn-outline-danger" @click="logout">Or click here to logout.</button>
        </div>
      </div>
    </div>
  </div>
</template>
