import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, onAuthStateChanged, setPersistence } from "firebase/auth";
import stores from "../stores";

const firebaseConfig = {
    apiKey: "AIzaSyDZw1Bi4CGZfTQUJlOV-B4TcRS73FhrIL8",
    authDomain: "restaurant-47bbe.firebaseapp.com",
    projectId: "restaurant-47bbe",
    storageBucket: "restaurant-47bbe.firebasestorage.app",
    messagingSenderId: "359784136917",
    appId: "1:359784136917:web:d3324ebac196fdc0bb225c",
    measurementId: "G-3WFKFPPF7M"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await stores.dispatch('setUser', user);
    }
})
setPersistence(auth, browserLocalPersistence);
export { auth, app };
