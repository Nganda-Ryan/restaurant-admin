<script setup lang="ts">
import { ref, defineAsyncComponent, defineProps, withDefaults, onMounted } from 'vue'
import TableOne from '@/components/Tables/TableOne.vue'
import ButtonAction from '@/components/Buttons/ButtonAction.vue'
import Spinner from '@/components/Utilities/Spinner.vue'
import router from '@/router'
import type { TeamMember } from '@/services/serviceInterface'
import { fetchContent, uploadContent, createPlate, generateCode, createContent, fetchProduct, updatePlate, getConsistency, createConsistency, fetchPlate, UpdateConsistency, updateContent } from '@/services/database';

const props = withDefaults(defineProps<{
  teamMembers?: TeamMember[];
  loading?: boolean;
  role: any[]; // or specify a more precise type if available, e.g. { name: string; api: string }[]
}>(), {
  teamMembers: () => [],
  loading: false
});

const emit = defineEmits<{
  (e: 'delete-member', id: number | string | undefined): void
}>();

// Composants asynchrones
const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'))
const PopupModal = defineAsyncComponent(() => import('@/components/Modals/PopupModal.vue'))
const MemberForm = defineAsyncComponent(() => import('@/components/SettingsComponent/TeamTables/NewTeamTable.vue'))

// États du composant
const isEditing = ref<boolean>(false)
const isModalOpen = ref(false)
const isDeleting = ref(false)
const isViewing = ref(true)
const showViewModal = ref(false)
const selectedMember = ref<TeamMember | null>(null)

const filterOptions = ref([
  {
    name: 'Tous',
    api: '',
  },
  {
    name: 'Actifs',
    api: 'status=active',
  },
  {
    name: 'Inactifs',
    api: 'status=inactive',
  },
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
    badgeVariant: (value: string) => value === 'active' ? 'success' : 'danger'
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

const roleOptions = ref(props.role) 
// Méthodes
const handleEditMember = (member: TeamMember) => {
  selectedMember.value = { ...member }
  isViewing.value = false
  isEditing.value = true
}

const handleDeleteMember = (member: TeamMember) => {
  selectedMember.value = member
  isModalOpen.value = true
}

const handleViewMember = (member: TeamMember) => {
  selectedMember.value = member
  showViewModal.value = true
}

const handleAddMember = () => {
  isViewing.value = false
  isEditing.value = false
}

const handleCloseModal = () => {
  isModalOpen.value = false
}

const deleteAction = async () => {
  try {
    isDeleting.value = true
    // Émet un événement pour que le parent gère la suppression
    emit('delete-member', selectedMember.value?.id)
    router.push({ path: '/settings/team' })
  } catch (e) {
    console.error("Erreur lors de la suppression:", e)
  } finally {
    isDeleting.value = false
    isModalOpen.value = false
  }
}

const goBack = () => {
  window.history.back()
}

const cancel = () => {
  isViewing.value = true
  isEditing.value = false
}

onMounted (() => 
{ 
  console.log('role', props.role)
  console.log('team', props.teamMembers)
  })
</script>

<template>
  <div>
    <!-- Vue tableau -->
    <div class="flex flex-col gap-10" v-if="isViewing">
      <TableOne 
        :items="titles" 
        :datas="teamMembers"
        @edit="handleEditMember"
        @remove="handleDeleteMember"
        @view="handleViewMember"
        :filterable="true"
        :pagination="true"
        :options="filterOptions"
      >
        <template v-slot:headerButton>
          <button-action 
            @click="handleAddMember" 
            custom-classes="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Ajouter un membre
          </button-action>
        </template>
      </TableOne>
    </div>

    <!-- Formulaire d'édition -->
    <template v-else-if="isEditing">
      <MemberForm  
        @cancel="cancel"  
        :action="'update'" 
        :member="selectedMember"
        :role="roleOptions"  
        @back="goBack"
      />
    </template>

    <!-- Formulaire de création -->
    <template v-if="!isViewing && !isEditing">
      <MemberForm 
        @cancel="cancel" 
        @back="cancel" 
        :role="roleOptions"  
        :action="'add'"
      />
    </template>

    <!-- Spinner de chargement -->
    <SpinnerOverPage v-if="loading"/>

    <!-- Modal de confirmation de suppression -->
    <PopupModal 
      :message="`Êtes-vous sûr de vouloir supprimer ${selectedMember?.name} ? Cette action est irréversible.`" 
      :is-open="isModalOpen" 
      v-if="isModalOpen" 
      @close="handleCloseModal" 
      :title="'Suppression de membre'"
    >
      <template v-slot:footer>
        <div class="bg-slate-50 px-4 py-2 sm:flex sm:flex-row-reverse sm:px-6">
          <button 
            @click="deleteAction" 
            type="button" 
            class="h-10 text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 text-center mb-2 flex justify-center items-center flex-nowrap"
          >
            Supprimer
            <span v-if="isDeleting" class="flex items-center justify-center">
              &nbsp;&nbsp;&nbsp;<Spinner/>
            </span>
          </button>
          <button 
            @click="handleCloseModal" 
            class="h-10 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-slate-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
          >
            <span class="h-9 relative px-5 py-2 transition-all ease-in duration-75 bg-white dark:bg-slate-900 rounded-md group-hover:bg-opacity-0">
              Annuler
            </span>
          </button>
        </div>
      </template>
    </PopupModal>

    <!-- Modal de visualisation -->
    <div v-if="showViewModal" class="fixed inset-0 z-99999 overflow-y-auto">
      <div class="fixed inset-0 bg-black bg-opacity-75" @click="showViewModal = false"></div>
      
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md sticky max-h-[90vh] flex flex-col">
          <div class="flex justify-between items-center border-b p-4 sticky top-0 bg-white">
            <h3 class="text-xl font-bold text-gray-800">
              Détails - {{ selectedMember?.name || 'Membre' }}
            </h3>
            <button @click="showViewModal = false" class="text-gray-500 hover:text-red-500">
              <i class="pi pi-times text-xl"></i>
            </button>
          </div>

          <div class="p-6 flex-1 space-y-4">
            <div>
              <h4 class="font-semibold">Informations</h4>
              <p>Nom: {{ selectedMember?.name }}</p>
              <p>Email: {{ selectedMember?.email }}</p>
              <p>Rôle: {{ selectedMember?.role }}</p>
              <p>Statut: 
                <span :class="{
                  'bg-green-100 text-green-800 px-2 py-1 rounded': selectedMember?.status === 'active',
                  'bg-red-100 text-red-800 px-2 py-1 rounded': selectedMember?.status === 'inactive'
                }">
                  {{ selectedMember?.status === 'active' ? 'Actif' : 'Inactif' }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>