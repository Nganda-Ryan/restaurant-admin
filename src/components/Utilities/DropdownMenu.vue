<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { onBeforeMount, onMounted, ref } from 'vue'
import type Option from './interfaceModel';

const target = ref(null)
const dropdownOpen = ref(false)
const notifying = ref(true)

onClickOutside(target, () => {
    dropdownOpen.value = false
})
const props = defineProps({
    options: {
        type: Array<Option>,
        required: true,
    },
    title: {
        type: String
    },
    modelValue: {
        type: Object
    }
});
const emits = defineEmits(['update:modeValue']);
const updateValue = (item: Option) => {
    emits('update:modeValue', item);
    dropdownOpen.value = !dropdownOpen.value;
    selectFilter.value = item;
}
const selectFilter = ref<Option>({
    name: "",
    api: "",

});
onBeforeMount(() => {
    selectFilter.value = props.modelValue as unknown as Option;;
});
</script>

<template>
    <div class="relative pb-8">
        <div class="absolute" ref="target">
            <router-link
                class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-2 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                to="#" @click.prevent="(dropdownOpen = !dropdownOpen), (notifying = false)">
                {{ selectFilter.name }}
            </router-link>

            <!-- Dropdown Start -->
            <div v-show="dropdownOpen" class="drop-shadow-lg shadow-sm relative -right-171.5 mt-3.5 flex flex-col rounded-md bg-white dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80">
                <ul class="flex h-auto flex-col overflow-y-auto p-1.5">
                    <template v-for="(item, index) in options" :key="index">
                        <li @click="updateValue(item)">
                            <h6 class="rounded-md p-2 pl-3 text-base font-medium text-slate-500 dark:text-white cursor-pointer hover:bg-slate-50">{{ item.name }}</h6>
                        </li>
                    </template>
                </ul>
            </div>
            <!-- Dropdown End -->
        </div>
    </div>
</template>
