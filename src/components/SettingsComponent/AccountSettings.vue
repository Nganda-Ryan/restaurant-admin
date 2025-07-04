<template>
  <div class="relative space-y-6">
    <!-- Bouton Edit en haut à droite -->
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
    <form @submit.prevent="handleSubmit">
      <!-- Informations de base -->
      <div class="bg-white shadow overflow-hidden rounded-lg p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Informations du compte</h3>
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div class="sm:col-span-4 relative">
            <label for="username" class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              v-model="user.name"
              :disabled="!editMode"
              class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"/>
            <div v-if="!editMode" class="disabled-field-overlay">
              <div class="stop-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="white" stroke="#ef4444" stroke-width="1.5"/>
                  <path fill="#ef4444" d="M16.59 7.58L10 14.17l-2.59-2.58L6 13l4 4 8-8z" transform="rotate(45 12 12)"/>
                </svg>
              </div>
            </div>
          </div>
  
          <div class="sm:col-span-4 relative">
            <label for="email" class="block text-sm font-medium text-gray-700">Adresse email</label>
            <input
              type="email"
              id="email"
              v-model="user.email"
              :disabled="!editMode"
              class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"/>
            <div v-if="!editMode" class="disabled-field-overlay">
              <div class="stop-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="white" stroke="#ef4444" stroke-width="1.5"/>
                  <path fill="#ef4444" d="M16.59 7.58L10 14.17l-2.59-2.58L6 13l4 4 8-8z" transform="rotate(45 12 12)"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section mot de passe (visible seulement en mode édition) -->
      <div v-if="editMode" class="bg-white shadow overflow-hidden rounded-lg p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Changer le mot de passe</h3>
        <div class="space-y-6">
          <!-- Mot de passe actuel -->
          <div class="relative">
            <label for="current-password" class="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
            <div class="relative">
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                id="current-password"
                v-model="currentPassword"
                class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg v-if="showCurrentPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Nouveau mot de passe -->
          <div class="relative">
            <label for="new-password" class="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <div class="relative">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                id="new-password"
                v-model="newPassword"
                @input="validatePassword"
                class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg v-if="showNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <!-- Confirmation mot de passe -->
          <div class="relative">
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
            <div class="relative">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirm-password"
                v-model="confirmPassword"
                @input="validatePassword"
                class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="!passwordMatch && confirmPassword" class="mt-1 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
          </div>

          <button
            @click="changePassword"
            :disabled="!isPasswordValid"
            class="flex items-center gap-2 bg-olive-600 text-white px-4 py-2 rounded-md hover:bg-olive-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Mettre à jour le mot de passe
          </button>
        </div>
      </div>

      <!-- Boutons d'action - Seulement visibles en mode édition -->
      <div v-if="editMode" class="flex justify-end gap-4 mt-6">
        <button 
          @click="cancelEdit"
          type="button" 
          class="text-white bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          class="flex items-center gap-2 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Enregistrer
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  user: Object
})

const emit = defineEmits(['update-user', 'password-change'])

const editMode = ref(false)
const localUser = ref({...props.user})
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordError = ref('')



// Validation des mots de passe
const passwordMatch = computed(() => {
  return newPassword.value === confirmPassword.value
})

const isPasswordValid = computed(() => {
  return currentPassword.value && 
         newPassword.value && 
         confirmPassword.value && 
         passwordMatch.value && 
         !passwordError.value
})

const validatePassword = () => {
  if (newPassword.value.length < 8) {
    passwordError.value = "Le mot de passe doit contenir au moins 8 caractères"
  } else if (!/[A-Z]/.test(newPassword.value)) {
    passwordError.value = "Le mot de passe doit contenir au moins une majuscule"
  } else if (!/[0-9]/.test(newPassword.value)) {
    passwordError.value = "Le mot de passe doit contenir au moins un chiffre"
  } else if (!/[^A-Za-z0-9]/.test(newPassword.value)) {
    passwordError.value = "Le mot de passe doit contenir au moins un caractère spécial"
  } else {
    passwordError.value = ""
  }
}

const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (!editMode.value) {
    localUser.value = {...props.user}
    resetPasswordFields()
  }
}

const cancelEdit = () => {
  editMode.value = false
  localUser.value = {...props.user}
  resetPasswordFields()
}

const resetPasswordFields = () => {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordError.value = ''
}

const handleSubmit = () => {
  emit('update-user', localUser.value)
  editMode.value = false
}

const changePassword = () => {
  if (!isPasswordValid.value) return
  
  emit('password-change', {
    current: currentPassword.value,
    new: newPassword.value
  })
  
  resetPasswordFields()
}
</script>

<style scoped>
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

.stop-icon {
  background: white;
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stop-icon svg {
  width: 24px;
  height: 24px;
  display: block;
}

input:disabled {
  background-color: #f9fafb;
}

button svg {
  vertical-align: middle;
}
</style>