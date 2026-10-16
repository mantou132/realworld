<script setup lang="ts">
import type { Errors, User } from '~/types';

const props = defineProps<{ register?: boolean }>();

const api = useApi();
const token = useToken();
const user = useUser();
const form = reactive({ username: '', email: '', password: '' });
const errors = ref<Errors>();

async function submit() {
  errors.value = await withErrors(async () => {
    const body = props.register ? form : { email: form.email, password: form.password };
    const result = await api<{ user: User }>(props.register ? '/users' : '/users/login', {
      method: 'POST',
      body: { user: body },
    });
    token.value = result.user.token;
    user.value = result.user;
  });
  if (!errors.value) await navigateTo('/');
}
</script>

<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">{{ register ? 'Sign up' : 'Sign in' }}</h1>
          <p class="text-xs-center">
            <NuxtLink v-if="register" to="/login">Have an account?</NuxtLink>
            <NuxtLink v-else to="/register">Need an account?</NuxtLink>
          </p>
          <ListErrors :errors="errors" />
          <form @submit.prevent="submit">
            <fieldset v-if="register" class="form-group">
              <input v-model="form.username" class="form-control form-control-lg" name="username" type="text" required placeholder="Username" />
            </fieldset>
            <fieldset class="form-group">
              <input v-model="form.email" class="form-control form-control-lg" name="email" type="email" required placeholder="Email" />
            </fieldset>
            <fieldset class="form-group">
              <input v-model="form.password" class="form-control form-control-lg" name="password" type="password" required placeholder="Password" />
            </fieldset>
            <button class="btn btn-lg btn-primary pull-xs-right" type="submit">{{ register ? 'Sign up' : 'Sign in' }}</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
