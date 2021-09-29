import { writable, derived } from "svelte/store";
import { getStore } from "./ystores";
import { getUser } from "./firebase";

// Editor
export const position = writable({ lineNumber: 1, column: 1 }); // player cursor position

// Timer
export const elapsed = writable(0); // how many seconds since timer start
export const interval = writable(null); // id of the current timer interval
export const timer = writable("-"); // timer in the format `-`
export const rounds = writable(0); // how many rounds played in the current session

// Keystrokes
export const keystrokes = writable({
  typedChars: [], // all the characters typed in this session // TODO can we just store the number?
  correctChars: 0, // how many correct characters has been typed
});

// Metrics is a store that derives from both keystrokes and elapses.
// When at least one second is elapsed and one character is typed
// we can calculate wpm and accuracy
export const metrics = derived([keystrokes, elapsed], ([$key, $elapsed]) => {
  if ($elapsed && $key.typedChars.length) {
    return {
      accuracy: Math.round(($key.correctChars / $key.typedChars.length) * 100),
      wpm: Math.floor(($key.correctChars / 5 / $elapsed) * 60),
    };
  } else {
    return { accuracy: null, wpm: null };
  }
});

// Match
export const players = writable([]); // the states of remote players

// The url of the selected file
export const fileUrl = getStore("file", "");

// Auth
export const user = getUser(); // the logged in user (null if not logged)
