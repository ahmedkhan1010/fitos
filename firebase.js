// Firebase bootstrap for FitOS.
// Public config values can live here, while secrets must stay out of the client.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAoI5qOWRRsN0aEXcdeUdaTQYUN2CGj2DA',
  authDomain: 'fitness-app-5aa0d.firebaseapp.com',
  projectId: 'fitness-app-5aa0d',
  storageBucket: 'fitness-app-5aa0d.firebasestorage.app',
  messagingSenderId: '660756865454',
  appId: '1:660756865454:web:a48aa0629e402ca773e83f',
  measurementId: 'G-96QM6C2VVR'
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
};
