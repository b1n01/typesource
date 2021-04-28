import { get } from "svelte/store";
import { elapsed, interval, timer } from "./stores";
import { userState } from "./states";

// Update timer (`00:00`) with the new elapsed time since last session start
const updateTimer = () => {
  let time = get(elapsed) + 1;
  let amount = time;
  let minutes = Math.floor(amount / 60) % 60;
  let minutesString = minutes.toString().padStart(2, "0");
  amount -= minutes * 60;
  let seconds = time % 60;
  let secondsString = seconds.toString().padStart(2, "0");
  let formatted = `${minutesString}:${secondsString}`;

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
  timer.set("00:00");
  elapsed.set(0);
  clearInterval(get(interval));
};
