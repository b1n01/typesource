// Xstate
// see https://github.com/davidkpiano/xstate/tree/master/packages/xstate-svelte
// see https://xstate.js.org/viz/

import { createMachine, interpret } from "xstate";

/**
 * This i the user state while using the app. It can be offline or online and
 * both states have substates.
 *
 * Use it like:
 * - import { userState } from '../states'
 * - $userState.value // get object state
 * - $userState.matches("offline.paused") // check single state
 * - ["online.lobby", "online.countdown"].some($userState.matches) // check against multimple states
 * - userState.send("GO") // emit event
 */
export const userState = interpret(
  createMachine({
    initial: "offline",
    states: {
      offline: {
        id: "offline",
        initial: "inactive",
        states: {
          inactive: {
            on: { START: "active" },
          },
          stopped: {
            on: { START: "active" },
          },
          active: {
            on: {
              PAUSE: "paused",
              STOP: "stopped",
            },
          },
          paused: {
            on: {
              STOP: "stopped",
              START: "active",
            },
          },
        },
      },
      online: {
        id: "online",
        initial: "lobby",
        states: {
          lobby: {
            on: { READY: "ready" },
          },
          ready: {
            initial: "waiting",
            on: { STOP: "#online.lobby" },
            states: {
              waiting: {
                on: { COUNTDOWN: "countdown" },
              },
              countdown: {
                on: { GO: "#online.playing" },
              },
            },
          },
          playing: {
            on: { END: "finished" },
          },
          finished: {
            on: { RESTART: "lobby" },
          },
        },
      },
    },
    on: {
      ONLINE: "online",
      OFFLINE: "offline",
    },
  })
).start();
