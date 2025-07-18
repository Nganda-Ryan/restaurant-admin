<template>
  <div class="relative">
    <!-- Bouton Edit icon seulement - style minimaliste -->
    <button 
      v-if="!editMode"
      @click="toggleEditMode"
      type="button"
      class="absolute top-0 right-0 p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Edit"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </button>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- En-tête avec logo et label -->
      <div class="flex items-center gap-4 mb-6">
        <!-- Logo -->
        <div class="relative group">
          <div class="w-35 h-35 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-stroke">
            <img 
              v-if="logoUrl || previewUrl" 
              :src="previewUrl || logoUrl" 
              class="w-full h-full object-cover"
              alt="Logo du restaurant"
            >
            <span v-else class="text-gray-500 text-sm">Logo</span>
          </div>
          
          <label 
            v-if="editMode"
            for="logo-upload" 
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <div class="bg-black bg-opacity-50 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </label>
          
          <input 
            v-if="editMode"
            id="logo-upload" 
            type="file" 
            accept="image/*" 
            class="hidden" 
            @change="handleLogoUpload"
          >
        </div>

        <!-- Label du restaurant -->
        <div>
          <label class="block text-lg font-medium text-gray-700 mb-1">Restaurant</label>
          <span class="text-3xl font-semibold">{{ formData.Name || 'Nom du restaurant' }}</span>
        </div>
      </div>

      <!-- Section informations de base -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup 
            label="Nom du restaurant" 
            type="text" 
            v-model="formData.Name" 
            :required="true"
            :disabled="!editMode"
          />
          <InputGroup 
            label="Adresse" 
            type="text" 
            v-model="formData.Address" 
            :required="true"
            :disabled="!editMode"
          />
          <InputGroup 
            label="Email" 
            type="email" 
            v-model="formData.Email" 
            :required="true"
            :disabled="!editMode"
          />
          <InputGroup 
            label="Téléphone" 
            type="tel" 
            v-model="formData.PhoneNumber" 
            :required="true"
            :disabled="!editMode"
          />

          <InputGroup 
            label="Site web" 
            type="url" 
            v-model="formData.Website"
            :disabled="!editMode"
          />

          <InputGroup 
            label="Capacité" 
            type="number" 
            v-model.number="formData.Capacity"
            :disabled="!editMode"
          />
          <select-group-one 
            label="Status" 
            :options="statusOptions" 
            placeholder="Sélectionnez le status"
            v-model="formData.Status" 
            required
            :disabled="!editMode"
          />
          <InputGroup 
            label="Moyens de paiement" 
            type="text" 
            v-model="formData.PaymentMethods"
            :disabled="!editMode"
          />
      </div>

      <!-- Description -->
        <InputGroup 
          label="Description" 
          type="textarea" 
          v-model="formData.Description"
          :rows="3"
          :disabled="!editMode"
        />

      <!-- Politiques -->            
          <InputGroup 
          label="Politiques" 
          type="textarea" 
          v-model="formData.Policies"
          :rows="2"
          :disabled="!editMode"
        />    
      <!-- Horaires d'ouverture -->
      <div class="space-y-4" :class="{ 'opacity-50': !editMode }">
        <h3 class="text-lg font-medium text-gray-900">Horaires d'ouverture</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="day in daysOfWeek" :key="day.value" class="space-y-2">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="openingDays[day.value]"
                class="rounded border-stroke text-primary focus:ring-primary"
                :disabled="!editMode"
              >
              <span class="ml-2">{{ day.label }}</span>
            </label>
            
            <div v-if="openingDays[day.value]" class="grid grid-cols-2 gap-2 ml-6">
                <InputGroup 
                  :label="'Ouverture ' + day.label" 
                  type="time" 
                  v-model="openingHours[day.value].opening"
                  hideLabel
                  :disabled="!editMode"
                />
                <InputGroup 
                  :label="'Fermeture ' + day.label" 
                  type="time" 
                  v-model="openingHours[day.value].closing"
                  hideLabel
                  :disabled="!editMode"
                />
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action - Seulement visibles en mode édition -->
      <div v-if="editMode" class="flex justify-end mt-10">
        <button 
          @click="cancelEdit"
          type="button" 
          class="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="flex flex-nowrap text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          <spinner v-if="isSaving" /> Save Modification
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineAsyncComponent } from 'vue'
import InputGroup from '@/components/Forms/InputGroup.vue'
import Spinner from '@/components/Utilities/Spinner.vue';
import EventBus from '@/EventBus';
import { updateResto, uploadContent, createContent, updateContent } from '@/services/database';
import type { Content } from '@/services/serviceInterface'
import { useAuthStore } from '@/stores/auth';

const DisabledFieldWrapper = defineAsyncComponent(() => import('../DisabledFieldWrapper.vue.vue'));
const SelectGroupOne = defineAsyncComponent(() => import('@/components/Forms/SelectGroup/SelectGroupOne.vue'));


const authStore = useAuthStore();
const _token = authStore.jwt;

const storedData = localStorage.getItem('profiles');
const dataArray = storedData ? JSON.parse(storedData) : [];
const restaurantCode = dataArray[0]?.RestaurantCode ?? '';

// Types
interface RestaurantFormData {
  Name: string
  Address: string
  Description: string
  Email: string
  PhoneNumber: string
  Website: string
  Capacity: number
  PaymentMethods: string
  Policies: string
  Status: 'ACTIVE' | 'INACTIVE'
  OpeningDays: string
}

interface OpeningHours {
  [key: string]: {
    opening: string
    closing: string
  }
}

interface OpeningDays {
  [key: string]: boolean
}

// Props
const props = defineProps<{
  initialData?: Partial<RestaurantFormData>
  restaurantData?: {
    content?: Array<{
      TypeCode: string
      Body: string
      Id: number
    }>
  }
}>()

// Données réactives
const formData = ref<RestaurantFormData>({
  Name: '',
  Address: '',
  Description: '',
  Email: '',
  PhoneNumber: '',
  Website: '',
  Capacity: 0,
  PaymentMethods: '',
  Policies: '',
  Status: 'ACTIVE',
  OpeningDays: '{}'
})

const editMode = ref(false);
const isSaving = ref(false);
const logoUrl = ref('')
const logoId = ref(0) // Pour stocker l'ID du logo si nécessaire
const previewUrl = ref('')
const selectedFile = ref<File | null>(null)
const openingDays = ref<OpeningDays>({})
const openingHours = ref<OpeningHours>({})

// Options
const daysOfWeek = [
  { value: 'Monday', label: 'Lundi' },
  { value: 'Tuesday', label: 'Mardi' },
  { value: 'Wednesday', label: 'Mercredi' },
  { value: 'Thursday', label: 'Jeudi' },
  { value: 'Friday', label: 'Vendredi' },
  { value: 'Saturday', label: 'Samedi' },
  { value: 'Sunday', label: 'Dimanche' }
]

const statusOptions = [
  { value: 'ACTIVE', label: 'Actif', name: 'Actif', api: 'ACTIVE' },
  { value: 'INACTIVE', label: 'Inactif', name: 'Inactif', api: 'INACTIVE' }
]

// Initialisation
onMounted(() => {
  console.log('Restaurant Code:', props.restaurantData?.content);
  initializeForm()
})

// Méthodes
const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

const cancelEdit = () => {
  editMode.value = false;
  initializeForm();
};

const initializeForm = () => {
  if (props.initialData) {
    formData.value = { ...formData.value, ...props.initialData }
    
    try {
      const days = JSON.parse(props.initialData.OpeningDays || '{}')
      daysOfWeek.forEach(day => {
        openingDays.value[day.value] = !!days[day.value]
        openingHours.value[day.value] = {
          opening: days[day.value]?.opening || '09:00',
          closing: days[day.value]?.closing || '18:00'
        }
      })
    } catch (e) {
      console.error("Erreur de parsing des horaires", e)
    }
  }

  if (props.restaurantData?.content) {
    const logoItem = props.restaurantData.content.find(item => item.TypeCode === 'LOGO')
    if (logoItem) {
      logoUrl.value = logoItem.Body
    }
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true;
    
    const openingDaysData: OpeningHours = {};
    daysOfWeek.forEach(day => {
      if (openingDays.value[day.value]) {
        openingDaysData[day.value] = {
          opening: openingHours.value[day.value].opening,
          closing: openingHours.value[day.value].closing
        }
      }
    });

    const submitData: RestaurantFormData = {
      ...formData.value,
      OpeningDays: JSON.stringify(openingDaysData),
      Capacity: Number(formData.value.Capacity) || 0
    };

    const result = await updateResto({ ...submitData, Code: restaurantCode }, _token);
    
   let logoUploadedUrl = logoUrl.value;
    if (selectedFile.value) {
      logoUploadedUrl = await uploadContent(selectedFile.value);
      if (logoUploadedUrl) {
        // 1. Récupérer l'ID EXISTANT correctement
        const currentLogoId = props.restaurantData?.content?.find(
          (item: any) => item.TypeCode === 'LOGO'
        )?.Id || 0;

        // 2. Préparer les données avec l'ID FORCÉMENT REMPLI
        const ctnList: Content[] = [{
          RestaurantCode: restaurantCode,
          Body: logoUploadedUrl,
          DisplayOrder: 0,
          Id: currentLogoId, // Doit être > 0 pour update
          TypeCode: 'LOGO'
        }];

        console.log('Envoi au serveur:', ctnList);

        // 3. Choisir entre update et create
        if (currentLogoId > 0) {
          await updateContent(ctnList, _token);
        } else {
          const createdContent = await createContent(ctnList, _token);
          if (createdContent?.[0]?.Id) {
            // Mettre à jour l'ID pour les futurs updates
            logoId.value = createdContent[0].Id;
          }
        }
      }
    }    EventBus.emit('showToast', {
      type: "success",
      message: "Restaurant updated successfully"
    });

    editMode.value = false;

  } catch (error: any) {
    console.error('Update error:', error);
    EventBus.emit('showToast', {
      type: "danger",
      message: error?.message || "An error occurred during update"
    });
  } finally {
    isSaving.value = false;
  }
};

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  selectedFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}
</script>

<style>
.disabled-field-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s;
}

.disabled-field-overlay:hover {
  opacity: 1;
}

input:disabled {
  background-color: #f9fafb;
}

button svg {
  vertical-align: middle;
}
</style>