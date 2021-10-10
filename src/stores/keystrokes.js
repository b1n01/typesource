import { writable } from "svelte/store";

const defaultKeystrokes = {
  typedChars: [], // all the characters typed in this session // TODO can we just store the number?
  correctChars: 0, // how many correct characters has been typed
};
export const keystrokes = writable(defaultKeystrokes);
export const resetKeystrokes = () => keystrokes.set(defaultKeystrokes);
