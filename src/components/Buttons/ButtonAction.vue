<script setup lang="ts">
const props = defineProps(['label', 'route', 'customClasses'])
</script>

<template>
  <button
    :to="props.route"
    class="inline-flex items-center justify-center gap-2.5 py-2 px-6 text-center font-medium hover:bg-opacity-90 lg:px-6 xl:px-6"
    :class="props.customClasses"
  >
    <slot></slot>
    {{ props.label }}
  </button>
</template>
