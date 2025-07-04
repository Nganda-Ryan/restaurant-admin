<script setup lang="ts">
  const props = defineProps<{
    tableId?: number,
    orderCode?: string | null,
    totalDishes?: number,
    state?: string
  }>();
</script>

<template>
    <div class="flex items-center px-2 py-2 mr-4 rounded-full bg-white shadow-sm drop-shadow-md min-w-64 cursor-pointer select-none">
      <span class="bg-yellow-400 rounded-full min-w-10 min-h-10 flex items-center justify-center mr-3">
        T2 
      </span>
      <div class="flex-grow">
        <div class="font-medium">{{ props.orderCode }}</div>
        <div>
        <span class="text-xs">{{ `${totalDishes} item(s)` }}</span> •
        <span class="bg-green-200 text-green-700 py-1 px-2 rounded-full text-xs font-medium ml-3 flex-shrink-0">{{ `${state}` }}</span>
        </div>
      </div>
    </div>
</template>