import { defineStore } from "pinia";
import { account } from "@/services/database";

export const useAuthStore = defineStore("authentication", {
  state: () => ({
    user: null as any,
    jwt: "" as string,
    RestaurantCode: "" as string,
    ws: null as WebSocket | null,
    isLoading: false,
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
    async login(email: string, password: string) {
      console.log("Tentative de connexion avec:", { email, password });
      this.isLoading = true;
      try {
        try {
          this.user = await account.get();
          if (this.user) return true; // Si l'utilisateur est déjà connecté, on retourne true
        } catch {
          // Ignorer si aucune session existante
        }

        await account.createEmailPasswordSession(email, password);
        await this.getToken();

        // Démarrer le système de renouvellement automatique
        this.startTokenAutoRefresh();

        return true;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
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
      this.RestaurantCode = "RESD4UjiMB1749635205603";
      localStorage.setItem("RestaurantCode", this.RestaurantCode);
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
        if (!this.isAuthenticated) return;

        console.log("Rafraîchissement automatique du token...");
        const jwtResponse = await account.createJWT();
        this.setJWT(jwtResponse.jwt);
      } catch (error) {
        console.error("Erreur lors du rafraîchissement du token:", error);
        // En cas d'erreur, on déconnecte l'utilisateur
        await this.logout();
      }
    },

    startTokenAutoRefresh() {
      // Arrêter l'intervalle existant s'il y en a un
      if (this.tokenRefreshInterval) {
        clearInterval(this.tokenRefreshInterval);
      }

      // Rafraîchir le token toutes les 14 minutes (840000 ms)
      this.tokenRefreshInterval = setInterval(() => {
        // this.refreshToken();
        this.getToken();
      }, 14 * 60 * 1000); // 14 minutes
    },

    stopTokenAutoRefresh() {
      if (this.tokenRefreshInterval) {
        clearInterval(this.tokenRefreshInterval);
        this.tokenRefreshInterval = null;
      }
    },

    async logout() {
      try {
        await account.deleteSession("current");
        this.stopTokenAutoRefresh();
        this.$reset();
      } catch (error) {
        console.error("Logout error:", error);
      }
    },

    async checkAuth() {
      try {
        this.user = await account.get();
        const jwtResponse = await account.createJWT();
        this.setJWT(jwtResponse.jwt);
        this.startTokenAutoRefresh(); // Démarrer le rafraîchissement automatique
      } catch {
        this.stopTokenAutoRefresh();
        this.$reset();
      }
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentToken: (state) => {
      console.debug("Current token from getter:", state.jwt);
      return state.jwt;
    },
    decodedToken: (state) => {
      if (!state.jwt) return null;
      try {
        return JSON.parse(atob(state.jwt.split(".")[1]));
      } catch {
        return null;
      }
    },
  },
  // persist: true,
});
