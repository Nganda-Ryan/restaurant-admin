<script setup lang="ts">
  import HeaderArea from '@/components/Header/HeaderArea.vue'
  import SidebarArea from '@/components/Sidebar/SidebarArea.vue'
  import Toast from '@/components/Alerts/Toast.vue';
  import { onBeforeMount, onMounted, ref } from 'vue';
  import { fetchConfig } from '@/services/database';
  import EventBus from '@/EventBus';
  import type ToastPayload from '@/types/Toast'
  import { useConfigStore } from '@/stores/config';
  import { useAuthStore } from '@/stores/auth';

  let toastVisible = ref(false);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let toast = ref<ToastPayload>({ type: 'info', message: '' });

  const configStore = useConfigStore();
  const authStore = useAuthStore();
  const handleShowToast = (payload: unknown) => {
    toast.value = payload as ToastPayload;
    toastVisible.value = true;
    hideToast();
  }
  const googleLoginBtn = ref<HTMLDivElement | null>(null)
  const clientId = "389621995817-nognoucvgoou81evmk9kts0t3iobjftc.apps.googleusercontent.com";
  const apiKey = "AIzaSyCvrOfTyH101mxaeHhpOLb6hT9C-rmBd4g";
  const scope = "https://www.googleapis.com/auth/drive.file";

  const hideToast = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    timeoutId = setTimeout(() => {
      toastVisible.value = false;
    }, 4000);
  }

  EventBus.on('showToast', handleShowToast);
  EventBus.on('hideToast', () => { toastVisible.value = false });

  

  const init = async () => {
    try {
      const config = await fetchConfig();
      console.log (config);
      configStore.plateCategories = config.PlatCategories;
      configStore.productCategories = config.ProductCategories;
      configStore.quantityUnits = config.QuantityUnits;
    } catch (err) {
      console.log("DefaultLayout.fetchMenu.error: " + err)
    } 
  };
  onMounted(async () => {
    await init();
    authStore.ws
  });
</script>

<template>
  <!-- ===== Page Wrapper Start ===== -->
   <div class="flex h-screen overflow-hidden">
    <!-- ===== Sidebar Start ===== -->
    <SidebarArea />
    <!-- ===== Sidebar End ===== -->

    <!-- ===== Content Area Start ===== -->
    <div class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
      <!-- ===== Header Start ===== -->
      <HeaderArea />
      <!-- ===== Header End ===== -->

      <!-- ===== Main Content Start ===== -->
      <main>
        <div class="mx-auto max-w-screen-2xl p-4 md:p-6 ">
          <slot></slot>
        </div>
      </main>
      <!-- ===== Main Content End ===== -->
    </div>
    <!-- <Toast :type="'danger'" :message="'toast.message'" /> -->
    <transition name="fade">
      <Toast v-if="toastVisible" :type="toast.type" :message="toast.message" />
    </transition>
    </div>
  <!-- ===== Page Wrapper End ===== -->
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
