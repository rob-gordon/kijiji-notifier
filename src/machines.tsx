import { Machine } from "xstate";
export const appMachine = Machine({
  initial: "idle",
  states: {
    idle: {
      on: {
        SET_INTERVAL: "updating"
      }
    },
    setTimer: {
      on: {
        TIME: "timing",
        TO_IDLE: "idle"
      }
    },
    timing: {
      on: {
        UPDATE: "updating",
        SET_INTERVAL: "setTimer",
        TO_IDLE: "idle"
      }
    },
    updating: {
      on: {
        FETCH: "fetching",
        TO_IDLE: "idle"
      }
    },
    fetching: {
      on: {
        FINISH: "setTimer",
        FETCH_ERROR: "setTimer",
        TO_IDLE: "idle"
      }
    }
  }
});
