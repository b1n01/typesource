import { user } from "./stores";
import { initializeApp } from "firebase/app";
import { isEqual } from "lodash";
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
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
});

// Init firestore db and setup local emulator
const db = getFirestore();

// Initialize the auth and setup the emulator
const auth = getAuth();

// Spin up emulators while developing
if (process.env.NODE_ENV === "development") {
  connectFirestoreEmulator(db, "localhost", 9991);
  connectAuthEmulator(auth, "http://localhost:9990");
}

// Wrap the Firebase auth user in a Svelte store
const getUser = () => {
  let handlers = [];
  let user = null;

  // Update all handlers whith logged in user
  auth.onAuthStateChanged((newUser) => {
    // Update all hanlders only if user has changed.
    if (!isEqual(user, newUser) || newUser === null) {
      user = newUser;
      handlers.forEach((handler) => handler(user));

      // If the user is logged out, log back in anonymously
      if (user === null) {
        signInAnonymously(auth).catch((e) =>
          console.error("Error while logging in the user anonymously.", e)
        );
      }
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
      return user;
    } catch (e) {
      console.error("Error adding user access token.", e);
    }
  } else {
    try {
      const loggedUser = result.docs[0];
      await updateDoc(loggedUser.ref, {
        accessToken: accessToken,
      });
      return user;
    } catch (e) {
      console.error("Error updating user access token.", e);
    }
  }
};

// Function to login/signup an user via Github
const login = async () => {
  const provider = new GithubAuthProvider();

  try {
    let response = await linkWithPopup(auth.currentUser, provider);
    return hanldeSignIn(response);
  } catch (e) {
    console.log("Error while linking anon. account", e);

    if (e.code === "auth/credential-already-in-use") {
      try {
        const credential = GithubAuthProvider.credentialFromError(e);
        let response = await signInWithCredential(auth, credential);
        return hanldeSignIn(response);
      } catch (e) {
        console.error("Error while signin in.", e);
      }
    }
  }
};

// Logout the current user
const logout = () => {
  signOut(auth);
};

export default firebase;
export { db, auth, getUser, login, logout };
