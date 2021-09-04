import { userReady, user } from "./stores";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  GithubAuthProvider,
  signOut,
  signInAnonymously,
  linkWithPopup,
  signInWithCredential,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
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
if (process.env.NODE_ENV === "development") {
  connectFirestoreEmulator(db, "localhost", 9991);
}

// Initialize the auth and setup the emulator
const auth = getAuth();
if (process.env.NODE_ENV === "development") {
  connectAuthEmulator(auth, "http://localhost:9990");
}

// Wrap the Firebase auth user in a Svelte store
const getUser = () => {
  let handlers = [];
  let user = null;

  // Update all handlers whith logged in user
  auth.onAuthStateChanged((newUser) => {
    // console.log("AuthStateChanded", newUser);
    userReady.set(true);
    user = newUser;
    handlers.forEach((handler) => handler(user));

    if (user == null) {
      signInAnonymously(auth);
      // .then() // todo handle response
      // .catch();
    }
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
    set: (newUser) => {
      user = newUser;
      handlers.forEach((handler) => handler(user));
    },
  };
};

// Handle user signin
const hanldeSignIn = async (response) => {
  // console.log("handling sign in");
  const credential = GithubAuthProvider.credentialFromResult(response);

  const accessToken = credential.accessToken;
  const loggedUser = response.user;
  user.set(loggedUser);

  const users = collection(db, "users");
  const select = query(users, where("uid", "==", loggedUser.uid));
  const result = await getDocs(select);

  if (result.empty) {
    try {
      await addDoc(users, {
        accessToken: accessToken,
        uid: loggedUser.uid,
      });
    } catch (e) {
      console.error("Error adding user access token ", e);
    }
  } else {
    try {
      const loggedUser = result.docs[0];
      await updateDoc(loggedUser.ref, {
        accessToken: accessToken,
      });
    } catch (e) {
      console.error("Error updating user access token ", e);
    }
  }
};

// Function to login/signup an user via Github
const login = () => {
  const provider = new GithubAuthProvider();

  linkWithPopup(auth.currentUser, provider)
    .then(hanldeSignIn)
    .catch((error) => {
      console.error("Error while linking anon. account", error.message);

      if (error.code === "auth/credential-already-in-use") {
        console.log("Try loggin in with old account");
        const credential = GithubAuthProvider.credentialFromError(error);
        signInWithCredential(auth, credential)
          .then(hanldeSignIn)
          .catch((error) => {
            console.error("Error while signin in", error.message);
          });
      }
    });
};

// Logout the current user
const logout = () => {
  signOut(auth);
};

export default firebase;
export { db, auth, getUser, login, logout };
