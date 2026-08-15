// Firebase project setup for "مذكرة" (Mothakera).
//
// The values below (apiKey, authDomain, etc.) are the public web config for
// your Firebase project — they identify the project to Firebase, they are
// not secret credentials, so it's normal and safe for them to live in
// client-side code that ships to the browser. Access to your data is
// controlled separately, by the security rules you set in the Firebase
// console (Firestore Database → Rules), not by hiding this config.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeWk6j5bhyYU1Wqk7hdePzyWi0z48zs3E",
  authDomain: "mothakera.firebaseapp.com",
  projectId: "mothakera",
  storageBucket: "mothakera.firebasestorage.app",
  messagingSenderId: "190513324303",
  appId: "1:190513324303:web:9051992a6fac8744071e7a",
  measurementId: "G-9ETLEEXM1Z",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
