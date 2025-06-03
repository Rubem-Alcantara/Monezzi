import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'; 
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 
import { getFirestore } from "firebase/firestore"; 


const firebaseConfig = {
  apiKey: "AIzaSyCWQz4-bemdqzNCfAWM8RoC3IamnKkmwu8",
  authDomain: "gestao-financeira-480f7.firebaseapp.com",
  projectId: "gestao-financeira-480f7",
  storageBucket: "gestao-financeira-480f7.firebasestorage.app",
  messagingSenderId: "54229046520",
  appId: "1:54229046520:web:798ddd802f3fb8c21fd70d",
  measurementId: "G-XKRQK0VBEV"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);

