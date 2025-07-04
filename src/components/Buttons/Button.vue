<script setup lang="ts">

  defineProps<{
    message: string,
    variant: 'info' | 'success' | 'danger' | 'warning'
  }>();

  const emit = defineEmits(['click']); 

  const handleClick = () => {
    emit('click'); 
  };
</script>

<template>
  <button
    @click="handleClick" 
    class="px-6 py-3 my-4 w-full rounded-lg font-medium text-white focus:outline-none"
    :class="[
      variant === 'info' ? 'bg-blue-500 hover:bg-blue-600' :
      variant === 'success' ? 'bg-green-500 hover:bg-green-600' :
      variant === 'danger' ? 'bg-red-500 hover:bg-red-600' :
      variant === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
      'bg-slate-500 hover:bg-slate-600' 
    ]"
  >
    {{ message }}
  </button>
</template>