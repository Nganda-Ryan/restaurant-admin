<script setup lang="ts">
    import { ref } from 'vue';

    const options = ref(['Dine in', 'Take Away']);
    const selectedOption = ref('Dine in'); 
</script>


<template>
    <div class="flex justify-between rounded-lg bg-slate-100">
      <button v-for="(option, index) in options" :key="index"
        @click="selectedOption = option"
        :class="{
          'py-2 px-4 rounded-lg w-full': true, 
          'bg-olive': selectedOption === option,
          'first:rounded-lg last:rounded-lg': options.length > 1
        }"
      >
        {{ option }}
      </button>
    </div>
</template>