import { defineStore } from "pinia";
import { account, getUser } from "@/services/database";
import type { User, Profile } from "@/services/serviceInterface";
import { AppwriteException } from "appwrite";

export const useAuthStore = defineStore("authentication", {
  state: () => ({
    user: null as any,
    users: [] as User[],
    profiles: [] as Profile[],
    restaurantCode: "" as string,
    userEmail: "" as string,
    jwt: "" as string,
    ws: null as WebSocket | null,
    isLoading: false,
    restoname: "" as string,
    RoleCode: "" as string,
    lastTokenUpdate: null as Date | null,
    tokenRefreshInterval: null as ReturnType<typeof setInterval> | null,
  }),
  actions: {
    async wsconnect(odercode: string, defaultmessage?: string) {
      //console.log("Tentative de connexion WebSocket avec:", odercode);
       
      try {
        const WSS_URL =
          "https://ws-order-resto.arouncloud.workers.dev/api/v1/orders/websocket?OrderCode=T4_20241023_1973";
        this.ws = new WebSocket(WSS_URL);

        this.ws.onopen = () => {
          //statusDiv.textContent = 'Status: Connected';
          console.log("Connected to WebSocket server.");
          if(defaultmessage){
            this.wssendMessage(defaultmessage)
          }
        };
        this.ws.onmessage = (event) => {
          console.log(event);
          const msg = JSON.parse(event.data);
          console.log(event, msg);
          if (msg.event) {
            //messagesDiv.innerHTML += `<div><i>System: A user ${msg.event.replace('_', ' ')}. Total users: ${msg.count}</i></div>`;
          } else {
            //messagesDiv.innerHTML += `<div>${msg.message}</div>`;
          }
          //messagesDiv.scrollTop = messagesDiv.scrollHeight;
        };

        this.ws.onclose = () => {
          //statusDiv.textContent = 'Status: Disconnected';
          console.log("Disconnected from WebSocket server.");
        };

        this.ws.onerror = (error) => {
          //statusDiv.textContent = 'Status: Error';
          console.error("WebSocket Error:", error);
        };
      } catch (error) {
        console.error("Erreur de connexion WebSocket:", error);
        throw error;
      }
    },
    async wssendMessage( messageInput: string) {
      const ws = this.ws;
       if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(messageInput);
                console.log("Message envoyé:", messageInput);
                messageInput = '';
            }
    },
    async fetchUserData(token: string) {
      try {
        if(token){
          const response = await getUser(token);
          const userData = response.user || {};
          const profileData = response.profiles || [];
          
          // Mise à jour du state sans toucher à this.user
          this.users = userData;
          this.profiles = profileData;
          this.restaurantCode = profileData[0]?.RestaurantCode || '';
          this.userEmail = userData.Email;
          this.RoleCode = profileData[0]?.RoleCode;

          // Persistance dans le localStorage
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("profiles", JSON.stringify(profileData));
          localStorage.setItem('restaurantCode', this.restaurantCode);
          localStorage.setItem('euser', this.userEmail);
          localStorage.setItem('userRole',this.RoleCode);
          console.log('User role stored:', this.RoleCode); // Ajouté pour débogage
          
          console.log('Données utilisateur mises à jour:', {
            users: this.users,
            profiles: this.profiles,
            restaurantCode: this.restaurantCode,
            email: this.userEmail,
            role: this.RoleCode
          });

          return response;
          
        } else {
          console.warn("Aucun token trouvé dans le localStorage.");
          throw new Error("Token not found");
        }
        
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        throw error;
      }
    },
    async login(email: string, password: string) {
      console.log("Tentative de connexion avec:", { email, password });
      try {
        console.log('inside the try block of login');
        const _userSession = await account.createEmailPasswordSession(email, password);
        if(_userSession){
          console.log('@@@@@before the getToken');
          const userToken = await this.getToken();
          if(userToken) {
            this.setJWT(userToken);
            console.log('@@@@@after the getToken');
            await this.fetchUserData(userToken);
            console.log('@@@@@after the fetchData');
            this.startTokenAutoRefresh();
            return true;
          } else {
            console.error("Échec de la récupération du token après la connexion.");
            throw new Error("Failed to retrieve token after login");
          }
        } else {
          console.error("Échec de la création de la session utilisateur.");
          throw new Error("Failed to create user session");
        }
        
      } catch (error) {
        if (error instanceof AppwriteException && error.type == "user_session_already_exists") {
          return true;
        }
        console.error("Login error:", AppwriteException || error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },


    async getToken() {
      try {
        this.user = await account.get();
        if (this.user) {
          const jwtResponse = await account.createJWT();
          this.setJWT(jwtResponse.jwt);
          return jwtResponse.jwt;
        }
        return null;
      } catch (error) {
        console.error("Erreur lors de la récupération du token:", error);
      }
    },

    setJWT(token: string) {
      
      this.jwt = token;
      localStorage.setItem("jwt", token);
      this.lastTokenUpdate = new Date();
      console.debug("JWT mis à jour:", {
        token,
        timestamp: this.lastTokenUpdate.toISOString(),
        decoded: this.decodeToken(token),
      });
    },

    decodeToken(token: string): any {
      try {
        if (!token || token.split(".").length !== 3) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return {
          header: JSON.parse(atob(token.split(".")[0])),
          payload,
          signature: token.split(".")[2],
        };
      } catch (e) {
        console.warn("Échec du décodage du token:", e);
        return null;
      }
    },

    async refreshToken() {
      try {
        if (!this.isAuthenticated) {
          console.warn("Refresh token tenté sans utilisateur authentifié");
          return false;
        }

        console.log("Rafraîchissement automatique du token...");
        const jwtResponse = await account.createJWT();
        
        if (!jwtResponse?.jwt) {
          throw new Error("Réponse JWT invalide");
        }
        
        this.setJWT(jwtResponse.jwt);
        return true;
        
      } catch (error) {
        console.error("Erreur lors du rafraîchissement du token:", error);
        await this.logout();
        return false;
      }
    },
    startTokenAutoRefresh() {
    this.stopTokenAutoRefresh(); // Nettoyage préalable   
      this.tokenRefreshInterval = setInterval(() => {
        this.refreshToken().catch(console.error);
      }, 14 * 60 * 1000); // 14 minutes
  },

    stopTokenAutoRefresh() {
      if (this.tokenRefreshInterval) {
        clearInterval(this.tokenRefreshInterval);
        this.tokenRefreshInterval = null;
      }
    },

// Modifiez logout pour nettoyer les nouvelles données
    async logout() {
      try {
        await account.deleteSession("current");
        this.clearLocalStorage();
        this.stopTokenAutoRefresh();
        this.$reset();
      } catch (error) {
        console.error("Logout error:", error);
      }
    },

    clearLocalStorage() {
      // Liste complète des clés à supprimer
      const keys = [
        'jwt', 'user', 'profiles', 'restaurantCode', 'euser', 'logoresto', 'logoresto_id',
        'newUser', 'newProfiles', 'preferences', 'restoname'
      ];
      
      keys.forEach(key => localStorage.removeItem(key));
    },

    // Ajoutez une méthode pour initialiser depuis le localStorage
    initializeFromLocalStorage() {
      if (typeof window !== 'undefined') {
        this.jwt = localStorage.getItem('jwt') || '';
        this.users = JSON.parse(localStorage.getItem('user') || 'null');
        this.profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
        this.restaurantCode = localStorage.getItem('restaurantCode') || '';
        this.userEmail = localStorage.getItem('euser') || '';
        this.RoleCode = localStorage.getItem('RoleCode') || '';
      }
    },
    async checkAuth() {
      try {
        this.user = await account.get();
        const jwtResponse = await account.createJWT();
        this.setJWT(jwtResponse.jwt);

        this.startTokenAutoRefresh();
        return true;
      } catch (error) {
        console.error("Check auth failed:", error);
        // En cas d'échec, nettoyer complètement
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        localStorage.removeItem('profiles');
        localStorage.removeItem('userRole');
        this.stopTokenAutoRefresh();
        this.$reset();
        return false;
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    currentToken: (state) => {
      console.debug("Current token from getter:", state.jwt);
      return state.jwt;
    },
    currentUserData: (state) => state.users,
    userProfiles: (state) => state.profiles,
    mainRestaurantCode: (state) => state.restaurantCode,
    decodedToken: (state) => {
      if (!state.jwt) return null;
      try {
        return JSON.parse(atob(state.jwt.split(".")[1]));
      } catch {
        return null;
      }
    },
  },
  persist: true,
});
