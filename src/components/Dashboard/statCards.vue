<template>
  <div class="bg-white dark:bg-boxdark p-6 rounded-lg shadow-default">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500 dark:text-slate-400">{{ title }}</p>
        <p class="text-2xl font-semibold mt-1 text-gray-800 dark:text-slate-200">{{ value }}</p>
      </div>
      <div 
        :class="[color, 'p-3 rounded-full text-xl']" 
        class="bg-opacity-20 dark:bg-opacity-30"
      >
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