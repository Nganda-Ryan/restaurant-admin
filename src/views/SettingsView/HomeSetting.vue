<template>
  <div class="settings-page p-6 w-full mx-auto">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">Paramètres du Restaurant</h1>

    <!-- Navigation horizontale -->
    <div class="w-full mb-8 overflow-x-auto">
      <nav class="flex space-x-1 min-w-max">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="changeTab(tab.id)"
          :class="{
            'bg-olive-50 text-olive-700': activeTab === tab.id,
            'text-gray-700 hover:bg-gray-50': activeTab !== tab.id
          }"
          class="px-6 py-3 rounded-md font-medium flex items-center gap-3 transition-colors whitespace-nowrap"
        >
          <span v-html="tab.icon" class="w-5 h-5"></span>
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Contenu des paramètres -->
    <div class="w-full bg-white rounded-lg shadow p-6">
      <!-- Spinner de chargement -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <Spinner />
      </div>

      <!-- Contenu quand non chargement -->
      <div v-else>
        <!-- Informations du restaurant -->
        <div v-if="activeTab === 'restaurant'" class="space-y-6">
          <h2 class="text-xl font-semibold mb-4">Informations du Restaurant</h2>
          <SettingsForm 
            :initialData="restaurantInfo"
            :restaurantData="{  content: restaurantInfo.allLogos?.length 
                              ? [{
                                  TypeCode: 'LOGO',
                                  Body: restaurantInfo.logoUrl,
                                  Id: restaurantInfo.logoId
                                }]
                              : []
                            }"
          />
        </div>
        
        <!-- Préférences -->
        <div v-if="activeTab === 'preferences'" class="space-y-6">
          <h2 class="text-xl font-semibold mb-4">Préférences</h2>
          <div class="w-full">
            <ToggleSetting 
            v-model:currencyValue="userCurrency"
            v-model:languageValue="userLanguage"
            />
          </div>
          <button 
            @click="savePreferences"
            class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Enregistrer les modifications
          </button>
        </div>

        <!-- Équipe -->
        <div v-if="activeTab === 'team'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">Gestion de l'équipe</h2>
          </div>
          <TeamTable
            :team-members="teamMembers" 
            :loading="isLoadingTeam"
            @delete-member="handleDeleteMember"
            :role="Role"
          />
        </div>

        <!-- Compte -->
        <div v-if="activeTab === 'account'" class="space-y-6">
          <h2 class="text-xl font-semibold mb-4">Paramètres du compte</h2>
          <AccountSettings 
            :user="currentUser"
            @password-change="handlePasswordChange"
            @email-change="handleEmailChange"
          />
        </div>
          
        <!-- Categorie des plats -->
        <div v-if="activeTab === 'Categorie plat'" class="space-y-6">
            <h2 class="text-xl font-semibold mb-4">Categories des plat</h2>
          <Categorieplate/>
        </div>
          
        <!-- Paramètres des tables -->
        <div v-if="activeTab === 'tables'" class="space-y-6">
          <h2 class="text-xl font-semibold mb-4">Paramètres des tables</h2>
          <TableSettings/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeMount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SettingsForm from '@/components/SettingsComponent/SettingsForm.vue'
import ToggleSetting from '@/components/SettingsComponent/ToggleSetting.vue'
import TeamTable from '@/components/SettingsComponent/TeamTables/TeamTable.vue'
import AccountSettings from '@/components/SettingsComponent/AccountSettings.vue'
import TableSettings from '@/components/SettingsComponent/Tables/TableSetting.vue'
import Categorieplate from '@/components/SettingsComponent/Categories/CategoriePlate.vue'
import Spinner from '@/components/Utilities/Spinner.vue'
import { fetchResto } from '@/services/database'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const configStore = useConfigStore()
const _token = authStore.jwt
console.log('Token utilisé:', _token);
// États de chargement
const isLoading = ref(false)
const isLoadingTeam = ref(false)
const initialLoad = ref(true)

// Données
const teamMembers = ref([])
const restaurantInfo = ref({})
const Role = ref([])
const userCurrency = ref('XAF') // Franc CFA par défaut
const userLanguage = ref('en')  // Français par défaut

const handlePasswordChange = (passwordData) => {
  console.log('Changement de mot de passe demandé:', passwordData)
}

const handleEmailChange = (emailData) => {
  console.log('Changement d\'email demandé:', emailData.newEmail)
}

// Onglets de navigation
const tabs = ref([
  {
    id: 'restaurant',
    label: 'Restaurant',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
          </svg>`
  },
  {
    id: 'preferences',
    label: 'Préférences',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>`
  },
  {
    id: 'team',
    label: 'Équipe',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>`
  },
  {
    id: 'account',
    label: 'Compte',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>`
  },    
  {
    id: 'tables',
    label: 'Table',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v16.5h16.5V3.75H3.75zM3.75 8.25h16.5M3.75 15.75h16.5M8.25 3.75v16.5M15.75 3.75v16.5" />
          </svg>`
  },
  {
    id: 'Categorie plat',
    label: 'Categorie plat',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 12h18M12 3v18" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.5 12h.01M12 12h.01M8.5 12h.01" />
      </svg>`
  },
/*   {
    id: 'langue',
    label: 'Langue',
    icon:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>`
  } */
])
// Active tab - initialisé en fonction de la query parameter ou du premier onglet
const activeTab = ref(route.query.parametre || tabs.value[0].id)

// Changement d'onglet avec gestion du chargement
const changeTab = (tabId) => {
  isLoading.value = true
  activeTab.value = tabId
  router.push({
    query: { 
      ...route.query,
      parametre: tabId 
    }
  })
  
  // Simuler un chargement (à adapter selon vos besoins réels)
  setTimeout(() => {
    isLoading.value = false
  }, 300)
}

// Synchronisation avec l'URL
watch(
  () => route.query.parametre,
  (newParam) => {
    if (newParam && tabs.value.some(tab => tab.id === newParam)) {
      isLoading.value = true
      activeTab.value = newParam
      setTimeout(() => {
        isLoading.value = false
      }, 300)
    }
  },
  { immediate: true }
)

function savePreferences() {
  console.log('Preferences saved:', preferences.value)
}

function savelangue() {
  console.log('Preferences saved:', langues.value)
}

// Paramètres du compte
const currentUser = ref({
  name: 'Admin',
  email: 'admin@resto.fr',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
})

const fetchRestaurant = async () => {
  try {
    isLoading.value = true
    initialLoad.value = true
    const response = await fetchResto(_token)
    console.log('infos', configStore.restaurantInfo)

     const logoItems = response.Restaurant.content?.filter(item => 
      item.TypeCode === 'LOGO'
    ) || [];

    // Prendre le logo principal (ex: le premier ou celui avec l'ID le plus élevé)
    const mainLogo = logoItems.reduce((prev, current) => 
      (current.Id) ? prev : current
    );

    
    // Infos sur le restaurant
    restaurantInfo.value = {
      Name: response.Restaurant.Name,
      Address: response.Restaurant.Address,
      Description: response.Restaurant.Description,
      Email: response.Restaurant.Email,
      PhoneNumber: response.Restaurant.PhoneNumber,
      Website: response.Restaurant.Website,
      Capacity: response.Restaurant.Capacity,
      PaymentMethods: response.Restaurant.PaymentMethods,
      Policies: response.Restaurant.Policies,
      Status: response.Restaurant.Status,
      OpeningDays: response.Restaurant.OpeningDays,
       logoUrl: mainLogo?.Body || '',
      logoId: mainLogo?.Id || 0,
      allLogos: logoItems // Garder une référence à tous les logos
    }
    authStore.restoname = restaurantInfo.value.Name
    
    // Info sur la team du restaurant
    teamMembers.value = response.users.map(item => ({
      name: item.user.FirstName + ' ' + item.user.LastName,
      email: item.user.Email,
      role: item.RoleCode,
      status: item.Status
    }));

    // Info sur les roles
    Role.value = response.roles.map(item => ({
      name: item.Label,
      api: item.Code
    }))
    
  } catch (e) {
    console.log('error:', e)
  } finally {
    isLoading.value = false
    initialLoad.value = false
  }
}

const handleDeleteMember = async (UserCode) => {
  try {
    isLoadingTeam.value = true
    console.log('Suppression du membre:', UserCode)
    // await deleteTeamMember(UserCode)
    // Recharger les données après suppression
    await fetchRestaurant()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    isLoadingTeam.value = false
  }
}

onBeforeMount(() => {
  fetchRestaurant()
})
</script>

<style scoped>
.settings-page {
  background-color: #f8fafc;
  min-height: 100vh;
  width: 100%;
}

/* Style pour la barre de navigation horizontale */
nav {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

nav::-webkit-scrollbar {
  height: 6px;
}

nav::-webkit-scrollbar-track {
  background: #f3f4f6;
}

nav::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 6px;
}
</style>