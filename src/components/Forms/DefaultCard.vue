<script setup lang="ts">
const props = defineProps(['cardTitle'])
</script>

<template>
  <div class="rounded-sm bg-white shadow-default">
    <div class="border-b border-stroke py-2 px-6.5 dark:border-strokedark flex gap-2 items-center">
      <slot name="button" class="flex items-center"></slot>
      <div class="flex w-full justify-between items-center">
        <h3 class="flex shrink-0 font-bold text-black dark:text-white p-2 rounded-md">{{ props.cardTitle }}</h3>
        <slot name="header"></slot>
      </div>
    </div>
    <slot></slot>
  </div>
</template>
