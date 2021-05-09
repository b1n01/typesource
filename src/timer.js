import { get } from "svelte/store";
import { elapsed, interval, timer, rounds } from "./stores";
import { userState } from "./states";

const round = 8; // how many seconds in a round

// Update timer (`00:00`) with the new elapsed time since last session start
const updateTimer = () => {
  let time = get(elapsed) + 1;
  if (time > round) {
    time = 1;
    rounds.set(get(rounds) + 1);
  }

  let formatted = (round - time).toString();
  timer.set(formatted);
  elapsed.set(time);
};

// Initialize the Timer to automatically start/pausa/stop the timer
// when the state changes.
export const init = () => {
  userState.subscribe((state) => {
    if (!state.changed) return;
    if (state.matches("offline.active")) start();
    if (state.matches("offline.paused")) pause();
    if (state.matches("offline.stopped")) stop();
    if (state.matches("online.lobby")) stop();
    if (state.matches("online.playing")) start();
    if (state.matches("online.finished")) pause();
  });
};

// Start the timer
export const start = () => {
  interval.set(setInterval(updateTimer, 1000));
};

// Pause the timer
export const pause = () => {
  clearInterval(get(interval));
};

// Stop the timer
export const stop = () => {
  timer.set(round);
  elapsed.set(0);
  clearInterval(get(interval));
};
