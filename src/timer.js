import { get } from "svelte/store";
import { elapsed, timer } from "./stores";
import { userState } from "./states";

const round = process.env.NODE_ENV === "development" ? 8 : 30; // how many seconds in a round
let interval = null; // id of the current timer interval
let shouldPause = false; // whether the timer is scheduled to pausa on next tick

// Update timer with the new elapsed time since last session start
const updateTimer = () => {
  let time = get(elapsed) + 1;
  if (time >= round) {
    time = 0;
    userState.send("END");
  } else {
    let formatted = (round - time).toString();
    timer.set(formatted);
    elapsed.set(time);
  }

  if (shouldPause) {
    userState.send("PAUSE");
  }
};

// Initialize the Timer to automatically start/pausa/stop the timer
// when the state changes.
export const init = () => {
  userState.subscribe((state) => {
    if (!state.changed) return;
    // Offline states
    if (state.matches("offline.active")) start();
    if (state.matches("offline.pausing")) schedulePause();
    if (state.matches("offline.paused")) pause();
    if (state.matches("offline.inactive")) stop();
    if (state.matches("offline.ended")) stop();
    // Online states
    if (state.matches("online.lobby")) stop();
    if (state.matches("online.playing")) start();
    if (state.matches("online.finished")) pause();
  });
};

// Start the timer
export const start = () => {
  shouldPause = false;
  interval = setInterval(updateTimer, 1000);
};

// Pause the timer
export const pause = () => {
  shouldPause = false;
  clearInterval(interval);
};

// Schedule the timer to pausa on next tick
export const schedulePause = () => {
  shouldPause = true;
};

// Stop the timer
export const stop = () => {
  shouldPause = false;
  timer.set("-");
  elapsed.set(0);
  clearInterval(interval);
};
