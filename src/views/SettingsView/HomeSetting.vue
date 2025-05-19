<template>
    <div class="settings-page p-6 w-full mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Paramètres du Restaurant</h1>
  
      <!-- Navigation horizontale -->
      <div class="w-full mb-8 overflow-x-auto">
        <nav class="flex space-x-1 min-w-max">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
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
        <!-- Informations du restaurant -->
        <div v-if="activeTab === 'restaurant'" class="space-y-6">
          <h2 class="text-xl font-semibold mb-4">Informations du Restaurant</h2>
          <SettingsForm 
            :fields="restaurantFields" 
            :initial-data="restaurantInfo"
            @submit="saveRestaurantInfo"
          />
        </div>
  
        <!-- Préférences -->
        <div v-if="activeTab === 'preferences'" class="space-y-6">
          <h2 class="text-xl font-semibold mb-4">Préférences</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ToggleSetting 
              v-for="pref in preferences"
              :key="pref.id"
              v-model="pref.value"
              :label="pref.label"
              :description="pref.description"
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
            <button 
              @click="showAddMemberModal = true"
              class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              <span>+</span> Ajouter un membre
            </button>
          </div>
          <TeamTable/>
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
          
        <!-- Categorie des plats -->
        <div v-if="activeTab === 'tables'" class="space-y-6">
          <h2 class="text-xl font-semibold mb-4">Paremetres des tables</h2>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">Gestion de l'équipe</h2>
            <button 
              @click="showAddMemberModal = true"
              class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              <span>+</span> Ajouter une table
            </button>
          </div>
          <TableSettings/>
        </div>
        <!-- langues -->
        <div v-if="activeTab === 'langue'" class="space-y-6">
            <h2 class="text-xl font-semibold mb-4">Parametre de la langue</h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ToggleSetting 
              v-for="lg in langues"
              :key="lg.id"
              v-model="lg.value"
              :label="lg.label"
              :description="lg.description"
            />
          </div>
          <button 
            @click="savelangue"
            class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import SettingsForm from '@/components/SettingsComponent/SettingsForm.vue'
  import ToggleSetting from '@/components/SettingsComponent/ToggleSetting.vue'
  import TeamTable from '@/components/SettingsComponent/TeamTable.vue'
  import AccountSettings from '@/components/SettingsComponent/AccountSettings.vue'
  import TableSettings from '@/components/SettingsComponent/TableSetting.vue'
  import Categorieplate from '@/components/SettingsComponent/Categories/CategoriePlate.vue'

  //import AddTeamMemberModal from '@/components/SettingsComponent/AddTeamMemberModal.vue'
//   import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'
  
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
    {
      id: 'langue',
      label: 'Langue',
      icon:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
        </svg>`
    }
  ]) 
  const titles = ref([
     {
        name: 'name',
        label: 'Nom',
        type: 'text',
        filterable: true
    },
    {
        name: 'email',
        label: 'Email',
        type: 'text',
        filterable: true
    },
    {
        name: 'role',
        label: 'Rôle',
        type: 'text',
        filterable: true
    },
    {
        name: 'status',
        label: 'Statut',
        type: 'badge',
        filterable: true,
        badgeVariant: (value) => value === 'active' ? 'success' : 'danger'
    },
    {
        name: 'actions',
        label: 'Actions',
        type: 'action',
        actions: [
            {
                name: 'Voir',
                event: 'view',
                icone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>`
            },
            {
                name: 'Modifier',
                event: 'edit',
                icone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>`
            },
            {
                name: 'Supprimer',
                event: 'remove',
                icone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>`
            }
        ]
    }
  ])

  const activeTab = ref('restaurant')
  
  // Données du restaurant
  const restaurantInfo = ref({
    name: 'Le Petit Bistro',
    address: '12 Rue de la Paix, Paris',
    phone: '01 23 45 67 89',
    email: 'contact@lepetitbistro.fr',
    openingHours: 'Lun-Sam: 11h-23h, Dim: 11h-17h',
    description: 'Un restaurant convivial proposant une cuisine française traditionnelle avec des ingrédients locaux.'
  })
  
  const restaurantFields = ref([
    { id: 'name', label: 'Nom du restaurant', type: 'text', required: true },
    { id: 'address', label: 'Adresse', type: 'text', required: true },
    { id: 'phone', label: 'Téléphone', type: 'tel', required: true },
    { id: 'email', label: 'Email', type: 'email', required: true },
    { id: 'openingHours', label: 'Heures d\'ouverture', type: 'text', required: true },
    { id: 'description', label: 'Description', type: 'textarea', required: false }
  ])
  
  function saveRestaurantInfo(data) {
    restaurantInfo.value = data
    console.log('Restaurant info saved:', data)
  }
  
  // Préférences
  const preferences = ref([
    { id: 'notifications', label: 'Notifications', description: 'Activer les notifications par email', value: true },
    { id: 'darkMode', label: 'Mode sombre', description: 'Activer l\'apparence sombre', value: false },
    { id: 'analytics', label: 'Analytics', description: 'Partager les données d\'analyse', value: true },
    { id: 'autoPrint', label: 'Impression auto', description: 'Imprimer automatiquement les commandes', value: false }
  ])
  
  function savePreferences() {
    console.log('Preferences saved:', preferences.value)
  }

  // langue
  const langues= ref([
    { id: 'francais', label: 'Francais', description: 'langue par defaut', value: true },
    { id: 'anglais', label: 'Angalais', description: 'Activer la langue Anglaise', value: false },
    { id: 'italien', label: 'Italien', description: 'Activer la langue Italienne', value: false },
    { id: 'allemand', label: 'Allemand', description: 'Activer la langue Allemande', value: false }
  ])
  
  function savelangue() {
    console.log('Preferences saved:', langues.value)
  }
  
  
  // Gestion de l'équipe
  const teamMembers = ref([
    { id: 1, name: 'Jean Dupont', email: 'jean@resto.fr', role: 'Gérant', status: 'active' },
    { id: 2, name: 'Marie Martin', email: 'marie@resto.fr', role: 'Serveur', status: 'active' },
    { id: 3, name: 'Pierre Lambert', email: 'pierre@resto.fr', role: 'Cuisinier', status: 'inactive' }
  ])
  
  const showAddMemberModal = ref(false)
  const memberToRemove = ref(null)
  
  function addTeamMember(member) {
    teamMembers.value.push({ ...member, id: Math.max(...teamMembers.value.map(m => m.id)) + 1 })
    showAddMemberModal.value = false
  }
  
  function editTeamMember(memberId) {
    console.log('Edit member:', memberId)
  }
  
  function confirmRemoveMember(memberId) {
    memberToRemove.value = memberId
  }
  
  function removeTeamMember() {
    teamMembers.value = teamMembers.value.filter(m => m.id !== memberToRemove.value)
    memberToRemove.value = null
  }
  
  // Paramètres du compte
  const currentUser = ref({
    name: 'Admin',
    email: 'admin@resto.fr',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  })
  
  function handlePasswordChange(newPassword) {
    console.log('Password changed')
  }
  
  function handleEmailChange(newEmail) {
    console.log('Email changed to:', newEmail)
  }
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