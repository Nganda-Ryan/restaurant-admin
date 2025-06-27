<template>
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
        
        <label for="logo-upload" class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <div class="bg-black bg-opacity-50 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </label>
        
        <input 
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
      />

      <InputGroup 
        label="Adresse" 
        type="text" 
        v-model="formData.Address" 
        :required="true"
      />

      <InputGroup 
        label="Email" 
        type="email" 
        v-model="formData.Email" 
        :required="true"
      />

      <InputGroup 
        label="Téléphone" 
        type="tel" 
        v-model="formData.PhoneNumber" 
        :required="true"
      />

      <InputGroup 
        label="Site web" 
        type="url" 
        v-model="formData.Website"
      />

      <InputGroup 
        label="Capacité" 
        type="number" 
        v-model.number="formData.Capacity"
      />
      <select-group-one 
      label="Status" 
      :options="statusOptions" 
      placeholder="Sélectionnez le status"
      v-model="formData.Status" 
      required
      />
      <InputGroup 
        label="Moyens de paiement" 
        type="text" 
        v-model="formData.PaymentMethods"
      />
    </div>

    <!-- Description -->
    <InputGroup 
      label="Description" 
      type="textarea" 
      v-model="formData.Description"
      :rows="3"
    />

    <!-- Politiques -->
    <InputGroup 
      label="Politiques" 
      type="textarea" 
      v-model="formData.Policies"
      :rows="2"
    />
    
    <!-- Horaires d'ouverture -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900">Horaires d'ouverture</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="day in daysOfWeek" :key="day.value" class="space-y-2">
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="openingDays[day.value]"
              class="rounded border-stroke text-primary focus:ring-primary"
            >
            <span class="ml-2">{{ day.label }}</span>
          </label>
          
          <div v-if="openingDays[day.value]" class="grid grid-cols-2 gap-2 ml-6">
            <InputGroup 
              :label="'Ouverture ' " 
              type="time" 
              v-model="openingHours[day.value].opening"
              hideLabel
            />
            <InputGroup 
              :label="'Fermeture '" 
              type="time" 
              v-model="openingHours[day.value].closing"
              hideLabel
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Boutons d'action -->
    <div class="flex justify-end mt-10">
      <button @click="$emit('cancel')" type="button" class="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
      Cancel
      </button>
      <button type="submit" class="flex flex-nowrap text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
        <spinner v-if="isSaving" /> Save Modification
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineAsyncComponent, computed } from 'vue'
import InputGroup from '@/components/Forms/InputGroup.vue'
import SelectGroup from '@/components/Forms/SelectGroup.vue'
import Spinner from '@/components/Utilities/Spinner.vue';
import type Option from '../../../src/components/Utilities/interfaceModel';
import EventBus from '@/EventBus';
import { updateResto, uploadContent, createContent,updateContent } from '@/services/database';
import type { Content } from '@/services/serviceInterface'

const emit = defineEmits(['saved', 'cancel']);

const SelectGroupOne = defineAsyncComponent(() => import('@/components/Forms/SelectGroup/SelectGroupOne.vue'));

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

const isSaving = ref<Boolean>(false);
const logoUrl = ref<string>('')
const previewUrl = ref<string>('')
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
   console.log('Restaurant Data:', props.restaurantData) // Vérifiez les données reçues
  console.log('Content:', props.restaurantData?.content)
  initializeForm()
})

// Méthodes
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
      console.log('Logo URL:', logoUrl.value) // Debug
    } else {
      console.warn('Aucun logo trouvé dans le content')
    }
  }
}

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

const removeLogo = () => {
  previewUrl.value = ''
  selectedFile.value = null
  logoUrl.value = ''
}

const handleSubmit = async () => {
  try {
    isSaving.value = true;
    
    // Préparation des horaires d'ouverture
    const openingDaysData: OpeningHours = {};
    daysOfWeek.forEach(day => {
      if (openingDays.value[day.value]) {
        openingDaysData[day.value] = {
          opening: openingHours.value[day.value].opening,
          closing: openingHours.value[day.value].closing
        }
      }
    });

    // Construction des données à envoyer
    const submitData: RestaurantFormData = {
      ...formData.value,
      OpeningDays: JSON.stringify(openingDaysData),
      Capacity: Number(formData.value.Capacity) || 0
    };

    // Ici vous devrez appeler votre service API pour la mise à jour
    // Par exemple: 
     const result = await updateResto({ ...submitData,
        Code: "RESD4UjiMB1749635205603"
     });
     console.log('update.resto:', result)
    // Si vous avez un logo à uploader
    let logoUploadedUrl = logoUrl.value;
    if (selectedFile.value) {
      logoUploadedUrl = await uploadContent(selectedFile.value);
      if (logoUploadedUrl) {
      const ctnList: Content[] = [{
        "Body": logoUploadedUrl,
        "DisplayOrder": 0,
        "Id":2,
        "TypeCode": 'LOGO'
        }]
        const createdCtn2 = await createContent(ctnList);
        console.log('log.restaurant', createdCtn2)
      }
    }

    // Gestion du feedback utilisateur
    const toastPayload = {
      type: "success",
      message: "Restaurant updated successfully"
    };
    EventBus.emit('showToast', toastPayload);

    // Émettre l'événement pour informer le parent
    emit('saved', { 
      data: submitData,
      logo: logoUploadedUrl 
    });

  } catch (error: any) {
    console.error('Update error:', error);
    const errMsg = error?.message || "An error occurred during update";
    const payload = {
      type: "danger",
      message: errMsg
    };
    EventBus.emit('showToast', payload);
  } finally {
    isSaving.value = false;
  }
};
</script>