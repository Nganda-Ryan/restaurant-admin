<template>
    <div class="rounded-sm bg-white shadow-default animate-pulse">
        <!-- Header Skeleton -->
        <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex gap-2 items-center">
            <div class="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-full"></div> <!-- Button Slot Skeleton -->
            <div class="flex w-full justify-between items-center">
                <div class="w-32 h-6 bg-slate-300 dark:bg-slate-700 rounded-md"></div> <!-- Title Skeleton -->
                <div class="w-12 h-6 bg-slate-300 dark:bg-slate-700 rounded"></div> <!-- Header Slot Skeleton -->
            </div>
        </div>
        <!-- Content Slot Skeleton -->
        <div class="p-4 space-y-3">
            <div class="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
            <div class="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
            <div class="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
    }

    .animate-pulse {
        animation: pulse 1.5s ease-in-out infinite;
    }
</style>
