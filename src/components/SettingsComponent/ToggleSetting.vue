<template>
    <div class="flex items-start">
      <div class="flex items-center h-5">
        <input
          :id="id"
          v-model="modelValue"
          type="checkbox"
          class="focus:ring-olive-500 h-4 w-4 text-olive-600 border-gray-300 rounded"
        />
      </div>
      <div class="ml-3 text-sm">
        <label :for="id" class="font-medium text-gray-700">{{ label }}</label>
        <p class="text-gray-500">{{ description }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    label: String,
    description: String,
    modelValue: Boolean
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const id = computed(() => `toggle-${Math.random().toString(36).substring(2, 9)}`)
  
  const modelValue = computed({
    get() {
      return props.modelValue
    },
    set(value) {
      emit('update:modelValue', value)
    }
  })
  </script>