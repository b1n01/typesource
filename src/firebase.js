import { initializeApp } from "firebase/app";
import { getAuth, useAuthEmulator } from "firebase/auth";
import { getFirestore, useFirestoreEmulator } from "firebase/firestore";

const firebase = initializeApp({
  apiKey: "AIzaSyC3oY0YGywi1nXOqqlyK6EdBd5JOEUMAx8",
  authDomain: "typesource-d7cc5.firebaseapp.com",
  projectId: "typesource-d7cc5",
  storageBucket: "typesource-d7cc5.appspot.com",
  messagingSenderId: "360526879897",
  appId: "1:360526879897:web:7a06f1c0f590702ed8ac08",
});

const auth = getAuth();
useAuthEmulator(auth, "http://localhost:9990");

const db = getFirestore();
useFirestoreEmulator(db, "localhost", 9991);

export default firebase;
export { auth, db };
