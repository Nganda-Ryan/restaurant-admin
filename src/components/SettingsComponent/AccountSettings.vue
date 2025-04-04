<template>
    <div class="space-y-6">
      <!-- Informations de base -->
      <div class="bg-white shadow overflow-hidden rounded-lg p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Informations du compte</h3>
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div class="sm:col-span-4">
            <label for="username" class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              v-model="user.name"
              class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black  dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"/>
          </div>
  
          <div class="sm:col-span-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Adresse email</label>
            <input
              type="email"
              id="email"
              v-model="user.email"
              class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black  dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"/>
          </div>
        </div>
      </div>
  
      <!-- Changement de mot de passe -->
      <div class="bg-white shadow overflow-hidden rounded-lg p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Changer le mot de passe</h3>
        <div class="space-y-6">
          <div>
            <label for="current-password" class="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
            <input
              type="password"
              id="current-password"
              v-model="currentPassword"
              class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black  dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"/>
          </div>
  
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <input
              type="password"
              id="new-password"
              v-model="newPassword"
              class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black  dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"/>
          </div>
  
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              id="confirm-password"
              v-model="confirmPassword"
              class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black  dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"/>
          </div>
  
          <button
            @click="changePassword"
            class="bg-olive-600 text-white px-4 py-2 rounded-md hover:bg-olive-700 transition-colors"
          >
            Changer le mot de passe
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    user: Object
  })
  
  const emit = defineEmits(['password-change', 'email-change'])
  
  const currentPassword = ref('')
  const newPassword = ref('')
  const confirmPassword = ref('')
  
  function changePassword() {
    if (newPassword.value !== confirmPassword.value) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    
    emit('password-change', {
      current: currentPassword.value,
      new: newPassword.value
    })
    
    // Réinitialiser les champs
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  }
  </script>