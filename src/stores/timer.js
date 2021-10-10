import { writable } from "svelte/store";

export const elapsed = writable(0); // how many seconds since timer start
export const timer = writable("-"); // timer in the format `-`
