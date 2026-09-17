import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBRba8lu6K8YRCA-50otIau6EJ_LVJWVSw",
  authDomain: "perritaapp2.firebaseapp.com",
  projectId: "perritaapp2",
  storageBucket: "perritaapp2.firebasestorage.app",
  messagingSenderId: "222127548783",
  appId: "1:222127548783:web:ae79ef980d5cdc4e50e09a"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: any;
try {
  auth = getAuth(app);
} catch (e) {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);