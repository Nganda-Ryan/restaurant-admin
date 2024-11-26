import { defineStore } from 'pinia';
import type { Content } from '@/services/serviceInterface';

export const useConfigStore = defineStore('config', {
  state: () => ({
    plateCategories: [] as Content[],
    productCategories: [] as Content[], 
    quantityUnits: [] as Content[], 
  }),
  actions: {
    
  },
  getters: {
    
  }
});

