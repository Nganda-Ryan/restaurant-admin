import { defineStore } from 'pinia';
import type { Content, User, Profile } from '@/services/serviceInterface';

export const useConfigStore = defineStore('config', {
  state: () => ({
    plateCategories: [] as Content[],
    productCategories: [] as Content[], 
    quantityUnits: [] as Content[], 
    users: [] as User[],
    profiles: [] as Profile[],
    restaurantInfo: [] as any
  }),
  actions: {
    
  },
  getters: {
    
  }
});

