import { defineStore } from 'pinia';
import { account } from '@/services/database';

export const useAuthStore = defineStore('authentication', {
  state: () => ({
    user: null as any,
    jwt: '' as string,
    isLoading: false,
    // Ajout pour le debug
    lastTokenUpdate: null as Date | null
  }),

  actions: {
    async login(email: string, password: string) {
      this.isLoading = true;
      try {
        try {
          await account.deleteSession('current');
        } catch {
          // Ignorer si aucune session existante
        }

        await account.createEmailPasswordSession(email, password);
        this.user = await account.get();
        
        // Génération du JWT
        const jwtResponse = await account.createJWT();
        this.setJWT(jwtResponse.jwt);
        
        return true;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Nouvelle action dédiée
    setJWT(token: string) {
      this.jwt = token;
      localStorage.setItem('jwt', token);
      this.lastTokenUpdate = new Date();
      console.debug('JWT mis à jour:', { 
        token, 
        timestamp: this.lastTokenUpdate.toISOString(),
        decoded: this.decodeToken(token) 
      });
    },

    // Méthode pour décoder le token (à usage de debug)
    decodeToken(token: string): any {
      try {
        if (!token || token.split('.').length !== 3) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          header: JSON.parse(atob(token.split('.')[0])),
          payload,
          signature: token.split('.')[2]
        };
      } catch (e) {
        console.warn('Échec du décodage du token:', e);
        return null;
      }
    },

    async logout() {
      try {
        await account.deleteSession('current');
        this.$reset();
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    async checkAuth() {
      try {
        this.user = await account.get();
        const jwtResponse = await account.createJWT();
        this.setJWT(jwtResponse.jwt); // Utilisation de la nouvelle méthode
      } catch {
        this.$reset();
      }
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentToken: (state) => {
      console.debug('Current token from getter:', state.jwt);
      console.log('currenttoken', state.jwt);
      return state.jwt;
    },
    // Nouveau getter pour le token décodé
    decodedToken: (state) => {
      if (!state.jwt) return null;
      try {
        return JSON.parse(atob(state.jwt.split('.')[1]));
      } catch {
        return null;
      }
    }
  }
});