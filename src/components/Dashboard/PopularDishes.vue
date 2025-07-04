<template>
    <div>
      <div class="grid grid-cols-3 gap-4 mb-2 px-4 font-semibold text-gray-500">
        <div>{{ $t('plat') }}</div>
        <div class="text-center">{{ $t('Likes') }}</div>
      </div>
      <div v-for="(dish, index) in dishes" :key="dish.name" 
           :class="{'bg-gray-50': index % 2 === 0}" 
           class="grid grid-cols-3 gap-4 p-4 rounded">
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