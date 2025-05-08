<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div v-for="field in fields" :key="field.id" class="space-y-2">
        <label :for="field.id" class="block text-sm font-medium text-gray-700">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500">*</span>
        </label>
        
        <input
          v-if="field.type !== 'textarea'"
          :id="field.id"
          v-model="formData[field.id]"
          :type="field.type"
          class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black  dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          :required="field.required"
        />
        
        <textarea
          v-else
          :id="field.id"
          v-model="formData[field.id]"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-olive-500 focus:ring-olive-500"
          :required="field.required"
        ></textarea>
      </div>
      
      <div class="flex justify-end">
        <button
          type="submit"
          class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Enregistrer
        </button>
      </div>
    </form>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    fields: Array,
    initialData: Object
  })
  
  const emit = defineEmits(['submit'])
  
  const formData = ref({})
  
  // Initialiser formData avec les données initiales
  watch(() => props.initialData, (newData) => {
    formData.value = { ...newData }
  }, { immediate: true })
  
  function handleSubmit() {
    emit('submit', formData.value)
  }
  </script>