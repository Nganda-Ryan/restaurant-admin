<script setup lang="ts">
  import { onBeforeMount, ref, watch } from 'vue'
  import type Option from '../../Utilities/interfaceModel';

  const selectedOption = ref<string>('')
  const isOptionSelected = ref<boolean>(false)

  const changeTextColor = (event:Event) => {
    isOptionSelected.value = true,
    updateValue(event);
  }
  const props = defineProps({
    label: String,
    options: {
      type: Array<Option>,
        required: true,
      },
      placeholder: String,
      disabled: Boolean,
      modelValue:String,
      multiple:Boolean
  });
  onBeforeMount(() => {
    selectedOption.value = props.modelValue??''
  });
  watch(() => props.modelValue, (newVal, oldVal) => {
    selectedOption.value = props.modelValue??''
  })
  const emits = defineEmits(['update:modelValue'])
  const updateValue = (event: Event) => {
    emits("update:modelValue", (event.target as HTMLInputElement).value);
  };
</script>

<template>
  <div>
    <label class="mb-3 block text-sm font-medium text-black dark:text-white">
      {{ label??'' }}
    </label>
    <div class="relative z-20 bg-white dark:bg-form-input">
      <span class="absolute top-1/2 left-4 z-30 -translate-y-1/2">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.8">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M10.0007 2.50065C5.85852 2.50065 2.50065 5.85852 2.50065 10.0007C2.50065 14.1428 5.85852 17.5007 10.0007 17.5007C14.1428 17.5007 17.5007 14.1428 17.5007 10.0007C17.5007 5.85852 14.1428 2.50065 10.0007 2.50065ZM0.833984 10.0007C0.833984 4.93804 4.93804 0.833984 10.0007 0.833984C15.0633 0.833984 19.1673 4.93804 19.1673 10.0007C19.1673 15.0633 15.0633 19.1673 10.0007 19.1673C4.93804 19.1673 0.833984 15.0633 0.833984 10.0007Z"
              fill="#637381"></path>
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M0.833984 9.99935C0.833984 9.53911 1.20708 9.16602 1.66732 9.16602H18.334C18.7942 9.16602 19.1673 9.53911 19.1673 9.99935C19.1673 10.4596 18.7942 10.8327 18.334 10.8327H1.66732C1.20708 10.8327 0.833984 10.4596 0.833984 9.99935Z"
              fill="#637381"></path>
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M7.50084 10.0008C7.55796 12.5632 8.4392 15.0301 10.0006 17.0418C11.5621 15.0301 12.4433 12.5632 12.5005 10.0008C12.4433 7.43845 11.5621 4.97153 10.0007 2.95982C8.4392 4.97153 7.55796 7.43845 7.50084 10.0008ZM10.0007 1.66749L9.38536 1.10547C7.16473 3.53658 5.90275 6.69153 5.83417 9.98346C5.83392 9.99503 5.83392 10.0066 5.83417 10.0182C5.90275 13.3101 7.16473 16.4651 9.38536 18.8962C9.54325 19.069 9.76655 19.1675 10.0007 19.1675C10.2348 19.1675 10.4581 19.069 10.6159 18.8962C12.8366 16.4651 14.0986 13.3101 14.1671 10.0182C14.1674 10.0066 14.1674 9.99503 14.1671 9.98346C14.0986 6.69153 12.8366 3.53658 10.6159 1.10547L10.0007 1.66749Z"
              fill="#637381"></path>
          </g>
        </svg>
      </span>
      <select v-model="selectedOption" :class="{ 'text-black dark:text-white': isOptionSelected }" @change="changeTextColor" :disabled="disabled"
        class="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-12 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input">
        <option value="" disabled selected>{{ placeholder }}</option>
        <option :value="item.api" class="text-body dark:text-bodydark h-203" v-for="(item, i) in options" :key="i">{{
          item.name as string }}
        </option>
      </select>
      <span class="absolute top-1/2 right-4 z-10 -translate-y-1/2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.8">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
              fill="#637381"></path>
          </g>
        </svg>
      </span>
    </div>
  </div>
</template>
