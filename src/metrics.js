import { get } from "svelte/store";
import {
  user,
  metrics,
  keystrokes,
  sessionData,
  elapsed,
  resetKeystrokes,
  resetMetrics,
} from "./stores";
import { userState } from "./states";
import { db } from "./firebase";
import { serverTimestamp, collection, addDoc } from "firebase/firestore";

export const init = () => {
  // Update metrics and store them to the sessionData array each seconds
  elapsed.subscribe((elapsed) => {
    const key = get(keystrokes);

    if (elapsed && key.typedChars.length) {
      const data = {
        accuracy: Math.round((key.correctChars / key.typedChars.length) * 100),
        wpm: Math.floor((key.correctChars / 5 / elapsed) * 60),
      };
      metrics.set(data);
      get(sessionData).push(data);
    }
  });

  // When a session had ended store metrics to firestore and reset
  // both keystrokes and metrics
  userState.subscribe((state) => {
    if (state.matches("offline.ended")) {
      const data = {
        wpm: get(metrics).wpm,
        accuracy: get(metrics).accuracy,
        typedChars: get(keystrokes).typedChars,
        correctChars: get(keystrokes).correctChars,
        uid: get(user).uid,
        timestamp: serverTimestamp(),
      };

      addDoc(collection(db, "metrics"), data);
      resetKeystrokes();
      resetMetrics();
    }
  });
};
