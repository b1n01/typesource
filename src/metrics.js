import { get } from "svelte/store";
import {
  user,
  metrics,
  keystrokes,
  showChart,
  sessionData,
  elapsed,
  resetKeystrokes,
  resetMetrics,
} from "./stores";
import { userState } from "./states";
import { db } from "./firebase";
import { serverTimestamp, collection, addDoc } from "firebase/firestore";

export const init = () => {
  // Update metrics (and data for the current session) each second
  elapsed.subscribe((elapsed) => {
    const strokes = get(keystrokes);

    if (elapsed && strokes.typedChars.length) {
      const data = {
        accuracy: Math.round(
          (strokes.correctChars / strokes.typedChars.length) * 100
        ),
        wpm: Math.floor((strokes.correctChars / 5 / elapsed) * 60),
      };
      metrics.set(data);
      get(sessionData).push(data);
    }
  });

  // When the state goes to stopped, save last round data
  // and show the chart
  userState.subscribe((state) => {
    if (state.matches("offline.stopped")) {
      showChart.set(true);

      // Store match results
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
