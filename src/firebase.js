import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPZxzqZhHu157YMSPY3KzQtKT6k_-XWv8",
  authDomain: "campus-lost-found-9dd12.firebaseapp.com",
  projectId: "campus-lost-found-9dd12",
  storageBucket: "campus-lost-found-9dd12.firebasestorage.app",
  messagingSenderId: "789309886570",
  appId: "1:789309886570:web:215d8c3e7cd9c6ac653a13"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);