// Xstate
// see https://github.com/davidkpiano/xstate/tree/master/packages/xstate-svelte
// see https://xstate.js.org/viz/

import { createMachine, interpret } from "xstate";

const stateMachine = createMachine({
  id: "editor-state",
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
});

export const state = interpret(stateMachine).start();
