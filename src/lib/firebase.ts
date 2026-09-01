import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  FirebaseStorage
} from 'firebase/storage';
interface FirebaseConfigShape {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

// Safely load optional firebase-applet-config.json if it exists, without throwing Vite import errors if deleted
const configModules = import.meta.glob<{ default: FirebaseConfigShape }>(
  '../../firebase-applet-config.json',
  { eager: true }
);
const fileConfig: FirebaseConfigShape = configModules['../../firebase-applet-config.json']?.default || {};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fileConfig.apiKey || 'AIzaSyDemoPlaceholderKey123456789',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fileConfig.authDomain || 'homevista-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fileConfig.projectId || 'homevista-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fileConfig.storageBucket || 'homevista-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fileConfig.messagingSenderId || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fileConfig.appId || '1:123456789012:web:demoappid12345'
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Storage
export const storage: FirebaseStorage = getStorage(app);

// Initialize Firestore with specific databaseId if provided
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || (
  fileConfig.firestoreDatabaseId && fileConfig.firestoreDatabaseId !== '(default)'
    ? fileConfig.firestoreDatabaseId
    : undefined
);

export const db: Firestore = databaseId 
  ? getFirestore(app, databaseId) 
  : getFirestore(app);

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  updateProfile,
  onAuthStateChanged,
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
};
export type { User };

