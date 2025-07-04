
<script setup lang="ts">
  import { ref, defineEmits, watch } from 'vue'
  import { onClickOutside } from '@vueuse/core'


  const props = defineProps({ 
    items:{
      type: Array as () => any[]
    },
    resetTrigger: {
      type: Boolean
    },
    label: String,
    placeholder: String,
    customClasses: String,
    required: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits<{
    (e: 'item-selected', selectedItem: string): void
  }>()

  // State variables
  const query = ref('')
  const filteredData = ref<any[]>([])
  const dropdownOpen = ref(false)
  const target = ref(null)


  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value
    if (dropdownOpen.value) {
      filterData();
    }
  }


  const filterData = () => {
    if (query.value.trim()) {
      if(props.items){
        filteredData.value = props.items.filter(item =>
        item.name.toLowerCase().includes(query.value.toLowerCase())
      )
      }
    } else {
      if(props.items){
        filteredData.value = props.items
      }
    }
  }

  const selectItem = (item: any) => {
    query.value = item.name
    emit('item-selected', item) // Emit selected item
    dropdownOpen.value = false // Close dropdown after selection
  }

  onClickOutside(target, () => {
  dropdownOpen.value = false
})

  watch(() => props.resetTrigger, (newVal, oldVal) => {
    if (newVal != oldVal) {
      query.value = '';
    }
  });
</script>


<template>
  <div :class="customClasses" ref="target">
    <label class="mb-2.5 block text-black dark:text-white" v-if="label">
      {{ label }}
      <span v-if="required" class="text-meta-1">*</span>
    </label>

    <div class="flex">
      <div class="relative w-full">
        <!-- Input Field -->
        <input
          type="text"
          v-model="query"
          @input="filterData"
          @click="toggleDropdown"
          :placeholder="placeholder"
          :required="required"
          class="w-full rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
        />

        <!-- Dropdown List -->
        <ul v-show="dropdownOpen" class="absolute z-10 bg-white divide-y divide-slate-100 rounded-lg shadow w-full drop-shadow-lg">
          <li v-for="(item, index) in filteredData" :key="index" class="p-2 cursor-pointer hover:bg-slate-100" @click="selectItem(item)">
            {{ item.name }}
          </li>
        </ul>   
      </div>
      <slot name="action"></slot>    
    </div>            
  </div>
</template>

<style scoped>
.relative {
  position: relative;
}
</style>
