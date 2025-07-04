<template>
  <div class="relative hover-disabled-container">
    <slot></slot>
    
    <div 
      v-if="disabled" 
      class="disabled-field-icon"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="white" stroke="#ef4444" stroke-width="2"/>
        <circle cx="12" cy="12" r="9" fill="#fee2e2" class="text-red-100"/>
        <line x1="6" y1="4" x2="18" y2="18" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>