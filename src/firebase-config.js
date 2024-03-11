import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDtPqW_W5NHGpJGQZhIt842lPQuNgO0B-U",
  authDomain: "my-project-8cd2e.firebaseapp.com",
  projectId: "my-project-8cd2e",
  storageBucket: "my-project-8cd2e.appspot.com",
  messagingSenderId: "755875078255",
  appId: "1:755875078255:web:e136e32b1d6f1897e7ed9a",
  measurementId: "G-VP64TQPCB5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 