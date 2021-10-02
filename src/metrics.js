import { get } from "svelte/store";
import { user, metrics, keystrokes, showChart, sessionData } from "./stores";
import { userState } from "./states";
import { db } from "./firebase";
import { serverTimestamp, collection, addDoc } from "firebase/firestore";

export const init = () => {
  let series = [];
  metrics.subscribe((amount) => {
    if (amount.wpm) series.push(amount);
  });

  // When the state goes to stopped, save last round data
  // and show the chart
  userState.subscribe((state) => {
    if (state.matches("offline.stopped")) {
      sessionData.set(series);
      series = [];
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

      // Reset metrics
      keystrokes.set({
        correctChars: 0,
        typedChars: [],
      });
    }
  });
};
