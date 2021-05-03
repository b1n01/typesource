import { userReady } from "./stores";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  useAuthEmulator,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  useFirestoreEmulator,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";

// Initialize the firebase app
const firebase = initializeApp({
  apiKey: "AIzaSyC3oY0YGywi1nXOqqlyK6EdBd5JOEUMAx8",
  authDomain: "typesource-d7cc5.firebaseapp.com",
  projectId: "typesource-d7cc5",
  storageBucket: "typesource-d7cc5.appspot.com",
  messagingSenderId: "360526879897",
  appId: "1:360526879897:web:7a06f1c0f590702ed8ac08",
});

// Init firestore db and setup local emulator
const db = getFirestore();
useFirestoreEmulator(db, "localhost", 9991);

// Initialize the auth and setup the emulator
const auth = getAuth();
useAuthEmulator(auth, "http://localhost:9990");

// Wrap the Firebase auth user in a Svelte store
const getUser = () => {
  let handlers = [];
  let user = null;

  // Update all handlers whith logged in user
  auth.onAuthStateChanged((user) => {
    userReady.set(true);
    user = user;
    handlers.forEach((handler) => handler(user));
  });

  return {
    subscribe: (handler) => {
      handler(user);
      handlers.push(handler);

      // Return the unsubscriber function
      return () => {
        const index = handlers.indexOf(handler);
        if (index !== -1) handlers.splice(index, 1);
      };
    },
  };
};

// Function to login/signup an user via Github
const login = () => {
  const provider = new GithubAuthProvider();
  signInWithPopup(auth, provider)
    .then(async (response) => {
      const credential = GithubAuthProvider.credentialFromResult(response);
      const accessToken = credential.accessToken;
      const user = response.user;

      const users = collection(db, "users");
      const select = query(users, where("uid", "==", user.uid));
      const result = await getDocs(select);

      if (result.empty) {
        try {
          await addDoc(users, {
            accessToken: accessToken,
            uid: user.uid,
          });
        } catch (e) {
          console.error("Error adding user access token ", e);
        }
      } else {
        try {
          const user = result.docs[0];
          await updateDoc(user.ref, {
            accessToken: accessToken,
          });
        } catch (e) {
          console.error("Error updating user access token ", e);
        }
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      const credential = GithubAuthProvider.credentialFromError(error);
      console.error(errorCode, errorMessage, email, credential);
    });
};

// Logout the current user
const logout = () => {
  signOut(auth);
};

export default firebase;
export { db, auth, getUser, login, logout };
