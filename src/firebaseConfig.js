import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDUCKLZvLzPqHYh9ae8HcJHajZ4nWRlkzA",
    authDomain: "camp-tracker-db.firebaseapp.com",
    projectId: "camp-tracker-db",
    storageBucket: "camp-tracker-db.firebasestorage.app",
    messagingSenderId: "585794066066",
    appId: "1:585794066066:web:dee70cc1ec788f5c1af84b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
