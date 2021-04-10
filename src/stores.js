import { writable } from "svelte/store";

// File
export const fileContent = writable(""); // the content of the selected file
export const selectedFile = writable(null); // the selected file
export const language = writable(null); // the language of the selected file
export const typedChars = writable([]); // all the characters typed in this session
export const correctChars = writable(0); // how many correct characters has been typed

// Timer
export const elapsed = writable(0); // how many seconds since timer start
export const interval = writable(null); // id of the current timer interval
export const timer = writable("00:00"); // timer in the format `00:00`
