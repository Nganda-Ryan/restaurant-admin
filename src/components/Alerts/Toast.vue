<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from 'vue'
import EventBus from '@/EventBus';
import type ToastPayload from '@/types/Toast'


const props = defineProps<ToastPayload>();

const alertClass = computed(() => {
  switch (props.type) {
    case 'success': {
      return 'bg-green-50 border-green-500 text-green-800'
    }
    case 'warning': {
      return 'bg-yellow-50 border-yellow-400 text-yellow-800'
    }
    case 'danger': {
      return 'bg-rose-50 border-rose-600 text-rose-800'
    }
    default: {
      return 'bg-blue-50 border-blue-400 text-blue-800';
    }
  }
});

const hideToast = () => {
  const payload: ToastPayload = {
    type: "success",
    message: "User created successfully"
  }
  EventBus.emit('hideToast', payload);
}
</script>

<template>
  <div class="z-99999 w-1/5 min-w-80 rounded-lg min-h-24 border-t-4 text-sm p-4 flex justify-between fixed bottom-4 right-5 lg:right-10"
    :class="alertClass">
    <div class="flex items-center">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd" />
        </svg>
        <p><span class="font-bold">Info : </span>{{ message }}</p>
      </div>
    </div>
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
        @click="hideToast">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  </div>
</template>

<style></style>
