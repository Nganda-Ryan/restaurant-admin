<script setup lang="ts">
  import HeaderArea from '@/components/Header/HeaderArea.vue'
  import SidebarArea from '@/components/Sidebar/SidebarArea.vue'
  import Toast from '@/components/Alerts/Toast.vue';
  import { onBeforeMount, onMounted, ref } from 'vue';
  import { fetchConfig, getUser, fetchResto } from '@/services/database';
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

const fetchRestaurant = async () => {
  try {
    const _token = authStore.jwt;
    const response = await fetchResto(_token);
    configStore.restaurantInfo = response;
    console.log('data.inforestaurant:', configStore.restaurantInfo);
    
    // Stockage dans localStorage
    if (response) {
      // 1. Stocker le nom du restaurant
      localStorage.setItem('restoname', response.Restaurant.Name);
      
      // 2. Trouver et stocker le premier logo
      if (response.Restaurant.content && response.Restaurant.content.length > 0) {
        const logoItem = response.Restaurant.content.find((item:any) => item.TypeCode === 'LOGO');
        if (logoItem) {
          localStorage.setItem('logoresto', logoItem.Body);
        }
      }
      
      console.log('Données stockées dans localStorage:',
        localStorage.getItem('restoname'),
        localStorage.getItem('logoresto')
      );
    }
    
  } catch (e) {
    console.log('error:', e);
  }
}

/*   const fetchUser = async () => {
    try {
      const response = await getUser()
      const userData = response.user || {}
      const profileData = response.profiles || []
      configStore.users = response.user
      configStore.profiles = response.profiles
      const restaurantCode = profileData[0]?.RestaurantCode || ''
      const userRole = profileData[0]?.RoleCode || 'CASHIER';
      const email = userData.Email
      console.log('data.user', configStore.users)
      console.log('data.profiles', configStore.profiles)
      console.log ('response', response)

      // Stocke les données utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(configStore.users))
      localStorage.setItem("profiles", JSON.stringify(configStore.profiles))
      localStorage.setItem('restaurantCode', restaurantCode)
      localStorage.setItem('euser', email)
      localStorage.setItem('userRole', userRole)
      console.log('Données utilisateur récupérées:', userData, profileData)
      console.log('Utilisateur:', response)
    } catch(error) {
      console.error('Erreur getUser:', error)
    }
  } */
  const init = async () => {
    try {
      const _token = authStore.jwt;
      const config = await fetchConfig(_token);
      console.log ("data.config",config);
      configStore.plateCategories = config.PlatCategories;
      configStore.productCategories = config.ProductCategories;
      configStore.quantityUnits = config.QuantityUnits;
    } catch (err) {
      console.log("DefaultLayout.fetchMenu.error: " + err)
    } 
  };
  const role = authStore.RoleCode;
  const email = authStore.userEmail;
  onBeforeMount(() => {
  authStore.initializeFromLocalStorage(); // Charge les données persistées AVANT le rendu
});
  onMounted(async () => {
    await init();
    //await fetchUser()
    await fetchRestaurant()
    console.log('Configuration récupérée@@@@@@@@@', configStore.plateCategories, configStore.productCategories, configStore.quantityUnits);
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
