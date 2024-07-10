import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCDbE7Z_syfiD1bZPsgOuQq494MrWRGu1o",
  authDomain: "webalumni-9e907.firebaseapp.com",
  projectId: "webalumni-9e907",
  storageBucket: "webalumni-9e907.appspot.com",
  messagingSenderId: "638100780430",
  appId: "1:638100780430:web:8e146b75b2625150e7a0df",
  measurementId: "G-DYSGTRJC4Z",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

export { auth, db, storage };
