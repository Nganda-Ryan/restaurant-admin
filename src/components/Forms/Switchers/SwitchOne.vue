<script setup lang="ts">
import { ref, watch } from 'vue'

const switcherToggle = ref<Boolean>(false);
const props = defineProps({
  title: {
    type: String,
  },
  modelValue: {
    type: Boolean,
  },
});
const emit = defineEmits(['update:modelValue'])
const valueChange = () => {
  switcherToggle.value = !switcherToggle.value;
  emit('update:modelValue', switcherToggle.value);
}
watch(() => props.modelValue, (newVal: Boolean, oldValue) => {
  switcherToggle.value = newVal;
})
</script>

<template>
  <div class="flex gap-4">
    <label v-if="title" class="flex text-black dark:text-white items-center">{{ title }}</label>
    <label for="toggle1" class="flex cursor-pointer select-none items-center">
      <div class="relative">
        <input type="checkbox" id="toggle1" class="sr-only" @change="valueChange" />
        <div class="block h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]"></div>
        <div :class="switcherToggle && '!right-1 !translate-x-full !bg-primary dark:!bg-white'"
          class="absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition"></div>
      </div>
    </label>
  </div>
</template>
