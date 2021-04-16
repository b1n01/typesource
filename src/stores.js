import { writable } from "svelte/store";

// File
export const fileContent = writable(""); // the content of the selected file
export const fileUrl = writable(""); // the url of the selected file
export const language = writable(null); // the language of the selected file
export const typedChars = writable([]); // all the characters typed in this session
export const correctChars = writable(0); // how many correct characters has been typed

// Timer
export const elapsed = writable(0); // how many seconds since timer start
export const interval = writable(null); // id of the current timer interval
export const timer = writable("00:00"); // timer in the format `00:00`

// Metrics
export const wpm = writable(null); // words per minutes
export const accuracy = writable(null); // accuracy percentages (correct chars / typed chars

// Players cursors
export const position = writable({ lineNumber: 1, column: 1 }); // player cursor position
