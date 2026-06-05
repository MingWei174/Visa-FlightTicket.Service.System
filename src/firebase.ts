/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3xzkEqR5yC8RIh_h6WJiSAVjezhbXdJo",
  authDomain: "oz-flight-visa-system.firebaseapp.com",
  projectId: "oz-flight-visa-system",
  storageBucket: "oz-flight-visa-system.firebasestorage.app",
  messagingSenderId: "1064387614479",
  appId: "1:1064387614479:web:0c04d55aaa7ff57e1a907a",
  measurementId: "G-J9Q0PV1FTX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc, signInWithPopup, signOut, onAuthStateChanged };
