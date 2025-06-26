import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8EcyV5nUwXPDlx3_KsYanqXQZCl_mOGc",
  authDomain: "stepbaby-dce7c.firebaseapp.com",
  projectId: "stepbaby-dce7c",
  storageBucket: "stepbaby-dce7c.appspot.com",
  messagingSenderId: "451441669106",
  appId: "1:451441669106:web:fe1f7e64d9784f490ab16b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);