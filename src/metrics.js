import { get } from "svelte/store";
import { rounds, user, metrics, keystrokes } from "./stores";
import { db } from "./firebase";
import { serverTimestamp, collection, addDoc } from "firebase/firestore";

export const init = () => {
  // Reset metrics on every round
  rounds.subscribe(() => {
    // Store match results
    // This check is required because on first subscription to 'rounds' the user could be not available yet
    if (get(user)) {
      const data = {
        wpm: get(metrics).wpm,
        accuracy: get(metrics).accuracy,
        typedChars: get(keystrokes).typedChars,
        correctChars: get(keystrokes).correctChars,
        uid: get(user).uid,
        timestamp: serverTimestamp(),
      };
      addDoc(collection(db, "metrics"), data);
    }

    // Reset metrics
    keystrokes.set({
      correctChars: 0,
      typedChars: [],
    });
  });
};
