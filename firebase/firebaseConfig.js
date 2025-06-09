// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyDUF2tancMPywZQEdG2XPQj-cUBDDz4iow",
  authDomain: "nowaste-9fdc9.firebaseapp.com",
  projectId: "nowaste-9fdc9",
  storageBucket: "nowaste-9fdc9.appspot.com",
  messagingSenderId: "851126160543",
  appId: "1:851126160543:web:b82b63c7ef585d8877e6aa",
  measurementId: "G-ZDQWPFD6YN",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
// ✅ Initialize Auth
export const auth = getAuth(app);
// ✅ Initialize Auth
setPersistence(auth, browserLocalPersistence);

// ✅ Initialize Firestore
export const db = getFirestore(app);

// ✅ Firestore Collection References
export const usersRef = collection(db, "users");
export const roomRef = collection(db, "rooms");