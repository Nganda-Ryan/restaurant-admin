<script setup lang="ts">
  import { useSidebarStore } from '@/stores/sidebar'
  import KitchenOrder from '../KitchenOrder/KitchenOrder.vue';

  const { toggleSidebar } = useSidebarStore()
  const sidebarStore = useSidebarStore()
</script>

<template>
  <footer class="fixed flex bottom-0 left-0 z-999 w-full px-4 py-2 bg-white shadow-top overflow-x-auto custom-scrollbar">
    <KitchenOrder />
    <KitchenOrder />
    <KitchenOrder />
    <KitchenOrder />
  </footer>
</template>

<style scoped>
  .shadow-top {
    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .custom-scrollbar {
    overflow-x: auto;
  }

  .custom-scrollbar::-webkit-scrollbar {
    height: 8px;  /* scrollbar height*/
    background-color: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4CAF50; 
    border-radius: 10px;
  }
</style>
