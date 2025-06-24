import { signOut, type UserCredential } from "firebase/auth";
import { createStore } from "vuex";
import VuexPersist from "vuex-persist";
import { auth } from "../firebase";
export interface State {
    user: UserCredential | undefined,
    language: String | undefined
    localUser: any
}
const vuexLocalStorage = new VuexPersist({
    key: "vuex", // The key to store the state on in the storage provider.
    storage: window.localStorage, // or window.sessionStorage or localForage
    // Function that passes the state and returns the state with only the objects you want to store.
    reducer: (state: State) => ({
        user: state.user,
        language: state.language,
        localUser: state.localUser,
    }),
    // Function that passes a mutation and lets you decide if it should update the state in localStorage.
    // filter: mutation => (true)
});

export default createStore<State>({
    state: {
        user: undefined,
        language: undefined,
        localUser: null
    },
    mutations: {
        /** set user language */
        setLanguage(state: State, language: String | undefined) {
            state.language = language;
        },
        setUser(state: State, user: UserCredential | undefined) {
            state.user = user;
        },
        setLocalUser(state: any, user: any) {
            state.localUser = user;
        },
        async logout(state: State) {
            await signOut(auth);
            state.user = undefined;
            state.localUser = null;
        }
    },
    actions: {
        setLanguage({ commit }, language: String | undefined) {
            commit("setLanguage", language);
        },
        setUser({ commit }, user: UserCredential | undefined) {
            commit("setUser", user);
        },
        logout({ commit }) {
            commit('logout')
        },
        setLocalUser({ commit }, user: any) {
            commit('setLocalUser', user);
        }
    },
    plugins: [vuexLocalStorage.plugin],
});
//
