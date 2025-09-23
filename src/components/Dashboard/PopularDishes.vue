<template>
  <div class="rounded-sm bg-white shadow-default dark:bg-boxdark">
    <div class="grid grid-cols-3 gap-4 mb-2 px-4 font-semibold text-gray-500 dark:text-slate-400">
      <div>{{ $t('plat') }}</div>
      <div class="text-center">{{ $t('Likes') }}</div>
    </div>
    <div 
      v-for="(dish, index) in dishes" 
      :key="dish.name" 
      :class="{
        'bg-gray-50 dark:bg-slate-700': index % 2 === 0,
        'dark:bg-slate-800': index % 2 !== 0
      }" 
      class="grid grid-cols-3 gap-4 p-4 rounded text-gray-700 dark:text-slate-300"
    >
      <div class="font-medium">{{ dish.name }}</div>
      <div class="text-center">{{ dish.Likes }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  dishes: Array
})
</script>