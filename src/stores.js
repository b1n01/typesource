import { get, writable, derived } from "svelte/store";
import { getStore } from "./ystores";
import { getUser } from "./firebase";

// Editor
export const position = writable({ lineNumber: 1, column: 1 }); // player cursor position

// Timer
export const elapsed = writable(0); // how many seconds since timer start
export const interval = writable(null); // id of the current timer interval
export const timer = writable("-"); // timer in the format `-`

// Keystrokes
const defaultKeystrokes = {
  typedChars: [], // all the characters typed in this session // TODO can we just store the number?
  correctChars: 0, // how many correct characters has been typed
};
export const keystrokes = writable(defaultKeystrokes);
export const resetKeystrokes = () => keystrokes.set(defaultKeystrokes);

// Metrics
const defaultMetrics = {
  accuracy: null,
  wpm: null,
};
export const metrics = writable(defaultMetrics);
export const resetMetrics = () => metrics.set(defaultMetrics);

// Last session data
export const sessionData = writable([]); // series of data for the last session

// Match
export const players = writable([]); // the states of remote players

// The url of the selected file
export const fileUrl = getStore("file", "");

// Auth
export const user = getUser(); // the logged in user (null if not logged)

// Explorer
export const search = writable(""); // content of the search input
export const repos = writable([]); // list of repos
export const files = writable([]); // list of files/folders in the selected repo
export const repoBaseUrl = writable(""); // base path of the selected repo
export const repoCurrentUrl = writable(""); // path of the repos's selected folder
export const selectedRepo = writable(null); // the selected repo
