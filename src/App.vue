<script setup lang="ts">
  import { computed, onBeforeMount } from 'vue';
  import { RouterLink, RouterView } from 'vue-router'
  import DefaultLayout from './layouts/DefaultLayout.vue';
  import router from './router';
  import stores from './stores';
  import { useAuthStore } from './stores/auth';

  const authStore = useAuthStore() 
  const isLogin = computed<boolean>(() => {
  return( router.currentRoute.value.path === '/login');
  });

</script>

<template>
  <!-- Si c’est la route de login, pas de layout -->
  <template v-if="isLogin">
    <RouterView />
  </template>

  <!-- Sinon, affichage avec le layout par défaut -->
  <template v-else>
    <DefaultLayout>
      <RouterView />
    </DefaultLayout>
  </template>
</template>
