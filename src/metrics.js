import { get } from "svelte/store";
import {
  typedChars,
  correctChars,
  elapsed,
  rounds,
  wpm,
  accuracy,
  user,
} from "./stores";
import { db } from "./firebase";
import { serverTimestamp, collection, addDoc } from "firebase/firestore";

export const init = () => {
  // Update accuracy when a character is typed
  typedChars.subscribe((typedChars) => {
    if (typedChars.length) {
      accuracy.set(Math.round((get(correctChars) / typedChars.length) * 100));
    } else {
      accuracy.set(null);
    }
  });

  // Update wpm when a character is typed
  elapsed.subscribe((elapsed) => {
    if (elapsed) {
      wpm.set(Math.floor((get(correctChars) / 5 / elapsed) * 60));
    } else {
      wpm.set(null);
    }
  });

  // Reset metrics on every round
  rounds.subscribe(() => {
    // Store match results
    // TODO: the user is always logged in (consider anonymous mode)
    if (get(user)) {
      const metrics = {
        wpm: get(wpm),
        accuracy: get(accuracy),
        typedChars: get(typedChars),
        correctChars: get(correctChars),
        uid: get(user).uid,
        timestamp: serverTimestamp(),
      };
      addDoc(collection(db, "metrics"), metrics);
    }

    // Reset metrics
    correctChars.set(0);
    typedChars.set([]);
  });
};
