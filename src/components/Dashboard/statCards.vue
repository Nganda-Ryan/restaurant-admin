<template>
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500">{{ title }}</p>
          <p class="text-2xl font-semibold mt-1">{{ value }}</p>
        </div>
        <div :class="color" class="p-3 rounded-full text-xl">
          {{ icon }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: String,
    value: [String, Number],
    icon: String,
    color: String
  })
  </script>