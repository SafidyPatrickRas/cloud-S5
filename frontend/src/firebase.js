import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVzRBM1hyxUo37zZ1ABBqzSIMiaDLzzPI",
  authDomain: "cloud-s5-groupe.firebaseapp.com",
  projectId: "cloud-s5-groupe",
  storageBucket: "cloud-s5-groupe.appspot.com",
  messagingSenderId: "1027801121111",
  appId: "1:1027801121111:web:8a615ba52c4139b63cbe12"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
