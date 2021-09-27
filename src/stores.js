import { writable } from "svelte/store";
import { getStore } from "./ystores";
import { getUser } from "./firebase";

// Editor
export const typedChars = writable([]); // all the characters typed in this session
export const correctChars = writable(0); // how many correct characters has been typed
export const position = writable({ lineNumber: 1, column: 1 }); // player cursor position

// Timer
export const elapsed = writable(0); // how many seconds since timer start
export const interval = writable(null); // id of the current timer interval
export const timer = writable("-"); // timer in the format `-`
export const rounds = writable(0); // how many rounds played in the current session

// Metrics
export const wpm = writable(null); // words per minutes
export const accuracy = writable(null); // accuracy percentages (correct chars / typed chars)

// Match
export const players = writable([]); // the states of remote players

// The url of the selected file
export const fileUrl = getStore("file", "");

// Auth
export const user = getUser(); // the logged in user (null if not logged)
