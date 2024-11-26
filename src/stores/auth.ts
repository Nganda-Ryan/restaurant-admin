import { defineStore } from 'pinia';
export const useAuthStore = defineStore('authentication', {
  state: () => ({
    gapi: {} as any,
    gapiToken: '' as any
  }),
  actions: {
    
  },
  getters: {
    
  }
});
