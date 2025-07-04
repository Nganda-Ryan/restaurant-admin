<script setup lang="ts">
import DropdownMenu from "@/components/Utilities/DropdownMenu.vue";
import InputGroup from "../Forms/InputGroup.vue";
import { onBeforeMount, ref, computed } from 'vue';
import type Option from "../Utilities/interfaceModel";
import Pagination from '../Pagination.vue'

interface TableColumn {
  label: string;
  name: string;
  type?: 'text' | 'url' | 'percentage' | 'image' | 'action';
  filterable?: boolean;
  inputField?: {
    type: string;
    placeholder: string;
  };
  event?: string;
  actions?: Array<{
    name: string;
    event: string;
    icone: string;
    colored?: boolean;
    color?: string;
  }>;
}

const props = defineProps({
  items: {
    type: Array<any>,
  },
  datas: {
    type: Array<any>
  },
  options: {
    type: Array<Option> 
  },
  filterable: {
    type: Boolean,
    default: false
  },
  inputField: {
    type: String,
  },
  pagination: {
    type: Boolean,
    default: false
  },
  searchable: {
    type: Boolean,
    default: false
  },
  component: {
    type: String,
    default: 'TableOne'
  }
});

const emits = defineEmits(['page-change']);

// Ajout pour la pagination
const currentPage = ref(1);
const pageSize = ref(10); // 10 éléments par page

const paginatedData = computed(() => {
  if (!props.datas) return [];
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return props.datas.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(((props.datas?.length ?? 0) / pageSize.value)) || 1;
});

function handlePageChange(page: number) {
  currentPage.value = page;
}

onBeforeMount(() => {
  selectFilter.value = props.options ? props.options[0] as Option : selectFilter.value;
});

const getCustomStyle = (option: any) => {
  if (option.style) {
    return 'px-6 py-3.5 ' + option.style;
  }
  return 'px-6 py-3.5';
};

const selectFilter = ref<Option>({ name: "", api: "", price: 0 });
</script>

<template>
  <div class="rounded-sm bg-white px-5 pt-0 pb-2.5 shadow-default dark:bg-boxdark sm:px-7.5 xl:pb-1 overflow-x-scroll md:overflow-x-auto">
    <!-- Header start -->
    <div class="flex justify-between items-center my-4 text-black" v-if="searchable || props.filterable">
      <div class="flex justify-between items-center text-sm font-semibold" v-if="props.filterable">
        <dropdown-menu :options="options ?? []" title="List view" v-model="selectFilter"></dropdown-menu>
      </div>
      <div class="flex">
        <input-group v-if="searchable" type="text" :placeholder="'Search element'"></input-group>&nbsp;&nbsp;&nbsp;
        <slot name="headerButton"></slot>
      </div>
    </div>
    <!-- Header end -->

    <!-- table start -->
    <table class="w-full text-base text-left rtl:text-right text-slate-500 dark:text-slate-400 mb-2">
      <thead class="text-sm text-slate-700 bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
        <tr>
          <th scope="col" class="px-6 py-3" v-for="(it, i) in items" :key="i">
           <div class="flex items-center">
              <h5 class="text-sm font-medium xsm:text-base">{{ it.label }}</h5>
              
              <a href="#" v-if="it.filterable">
                <svg class="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"/>
                </svg>
              </a>
           </div>
          </th>
        </tr>
      </thead>

      <template v-if="paginatedData && paginatedData.length > 0">
        <tbody>
          <tr v-for="(dt, key) in paginatedData" :key="key" :class="`bg-white hover:bg-teal-50 dark:bg-slate-800`">
            <td :class="getCustomStyle(it)" v-for="(it, i) in items" :key="i">
             
              <template v-if="dt[it.name as string] !== undefined">
                <template v-if="it.type === 'url'">
                  <a href="#" v-if="it.event" @click="emits(it.event, dt)">{{ dt[it.name] }}</a>

                  <input v-if="it.inputField" 
                    :type="it.inputField.type" 
                    :placeholder="it.inputField.placeholder" 
                    v-model="dt.inputField"
                    class="w-full h-8 rounded border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-slate-50 dark:disabled:bg-black  dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"/>
                  
                </template>
                <template v-else-if="it.type === 'percentage'">
                  {{ dt[it.name] }} <span>%</span>
                </template>
                <template v-else-if="it.type === 'image'">
                  <template v-if="dt[it.name].trim() != ''">
                    <img :src="dt[it.name]" :alt="dt.Title" class="w-9 h-9 rounded-full text-xs"/>
                  </template>
                  <template v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6 ml-1.5">
                      <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clip-rule="evenodd" />
                      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                    </svg>
                  </template>
                </template>
                <template v-else>
                  {{ dt[it.name] }}
                </template>
              </template>
              
              <template v-else-if="it.type === 'action'">
                <div class="flex items-center">
                  <template v-for="(ac, y) in it.actions">
                    <template v-if="it.colored">
                      <button type="button" :key="y" @click="emits(ac.event, dt)" :title="ac.name" class="mx-1">
                        <template v-if="dt?.event == ac.event">
                          <div :class="ac.color" class="p-[1px]"><span v-html="ac.icone"></span></div>
                        </template>
                        <template v-else>
                          <div class="p-[1px]">
                            <span v-html="ac.icone"></span>
                          </div>
                        </template>
                      </button>
                    </template>
                    <template v-else>
                      <button type="button" :key="y" @click="emits(ac.event, dt)" :title="ac.name" class="mx-1">
                        <span v-html="ac.icone"></span>
                      </button>
                    </template>
                  </template>
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </template>
      <template v-else>
        <tr>
          <td v-if="items && items.length" :colspan="items.length" :class="`text-center py-5 font-bold w-full`">No row to display 🍕</td>
        </tr>
      </template>
    </table>
    <!-- table end -->

    <!-- Pagination start -->
    <pagination 
      v-if="props.datas && props.datas.length > 0 && pagination" 
      :total-page="totalPages" 
      :total-element="props.datas.length" 
      :page-size="pageSize"
      :current-page="currentPage"
      @page-change="handlePageChange"
    />
    <!-- Pagination end -->
  </div>
</template>