import { writable } from "svelte/store";

// This stores are so so we can respore the Explorer state
// when we navigate away and then back to the main page, but is only a
// nice to have, if this is having troubles move this as local variable
// of Explorer
export const search = writable(""); // content of the search input
export const repos = writable([]); // list of repos
export const files = writable([]); // list of files/folders in the selected repo
export const repoBaseUrl = writable(""); // base path of the selected repo
export const repoCurrentUrl = writable(""); // path of the repos's selected folder
export const selectedRepo = writable(null); // the selected repo
