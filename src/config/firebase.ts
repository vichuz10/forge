import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCDHZTFo9yU8di4N3vTez3W7I5Q2NAnG98",
  authDomain: "forge-app-baee7.firebaseapp.com",
  projectId: "forge-app-baee7",
  storageBucket: "forge-app-baee7.firebasestorage.app",
  messagingSenderId: "563155486988",
  appId: "1:563155486988:web:ce83e72e917f6db4096129"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
