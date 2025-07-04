<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
    totalPage: {
        type: Number,
        required: true
    },
    totalElement: {
        type: Number,
        required: true
    },
    pageSize: {
        type: Number,
        required: true
    },
    currentPage: {
        type: Number,
        default: 1
    }
});

const emit = defineEmits(['page-change']);

const currentPage = ref(props.currentPage);

const fromElement = computed(() => {
    return (currentPage.value - 1) * props.pageSize + 1;
});

const toElement = computed(() => {
    return Math.min(currentPage.value * props.pageSize, props.totalElement);
});

const showingElement = computed(() => {
    return `${fromElement.value}-${toElement.value} of ${props.totalElement}`;
});

const pagesToShow = computed(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(props.totalPage, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    
    return pages;
});

function goToPage(page: number) {
    if (page >= 1 && page <= props.totalPage && page !== currentPage.value) {
        currentPage.value = page;
        emit('page-change', page);
    }
}

function prevPage() {
    goToPage(currentPage.value - 1);
}

function nextPage() {
    goToPage(currentPage.value + 1);
}
</script>

<template>
    <div class="flex items-center justify-between border-t border-slate-200 bg-white dark:bg-boxdark px-4 py-3 sm:px-6">
        <!-- Mobile version -->
        <div class="flex flex-1 justify-between sm:hidden">
            <button 
                @click="prevPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <button 
                @click="nextPage"
                :disabled="currentPage === totalPage"
                class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
        
        <!-- Desktop version -->
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
                <p class="text-sm text-slate-700 dark:text-slate-300">
                    Showing
                    <span class="font-medium">{{ fromElement }}</span>
                    to
                    <span class="font-medium">{{ toElement }}</span>
                    of
                    <span class="font-medium">{{ totalElement }}</span>
                    results
                </p>
            </div>
            
            <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <ul class="inline-flex -space-x-px text-base h-10">
                        <!-- Previous button -->
                        <li>
                            <button
                                @click="prevPage"
                                :disabled="currentPage === 1"
                                class="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-slate-500 bg-white border border-e-0 border-slate-300 rounded-s-lg hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                        </li>
                        
                        <!-- Page numbers -->
                        <li v-for="page in pagesToShow" :key="page">
                            <button
                                @click="goToPage(page)"
                                :class="{
                                    'text-black bg-slate-200 dark:bg-slate-700 dark:text-white': currentPage === page,
                                    'text-slate-500 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700': currentPage !== page
                                }"
                                class="flex items-center justify-center px-4 h-10 leading-tight border border-slate-300 dark:border-slate-700"
                            >
                                {{ page }}
                            </button>
                        </li>
                        
                        <!-- Next button -->
                        <li>
                            <button
                                @click="nextPage"
                                :disabled="currentPage === totalPage"
                                class="flex items-center justify-center px-4 h-10 leading-tight text-slate-500 bg-white border border-slate-300 rounded-e-lg hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>