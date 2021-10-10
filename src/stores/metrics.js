import { writable } from "svelte/store";

const defaultMetrics = { accuracy: null, wpm: null };
export const metrics = writable(defaultMetrics);
export const resetMetrics = () => metrics.set(defaultMetrics);

// Last session data
export const sessionData = writable([]); // series of data for the last session
