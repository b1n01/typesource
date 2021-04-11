import { get } from "svelte/store";
import { typedChars, correctChars, elapsed, wpm, accuracy } from "./stores";

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
};
