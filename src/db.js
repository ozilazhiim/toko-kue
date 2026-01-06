import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDylyWR9-Ruqc6PtKt0t3a-RfJj5oyKIvo", 
  authDomain: "toko-kue-wa.firebaseapp.com",
  projectId: "toko-kue-wa",
  storageBucket: "toko-kue-wa.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);       
const storage = getStorage(app);    
const auth = getAuth(app);          

export { db, storage, auth };