import * as Y from "yjs";

// Ydoc shared instance
export const ydoc = new Y.Doc();

// Get a Y.Map wrapped in a svelte store
export const getMap = (name) => {
  let handlers = []; // array of subscribers callbacks
  let ymap = ydoc.getMap(name); // the Y.Map

  // Listen the ymap and update all local subscribers
  ymap.observe(() => {
    handlers.forEach((handler) => handler(ymap));
    // TODO: should we start observing the ymap only when we get the first subscriber?
  });

  return {
    // Return a subscriber function that handle the subscribers
    // see https://svelte.dev/docs#Store_contract
    subscribe: (handler) => {
      handler(ymap);
      handlers.push(handler);

      // Return an unsubscribe function that remove the subscribers from the list of subsribers
      return () => {
        const index = handlers.indexOf(handler);
        if (index !== -1) handlers.splice(index, 1);
        // TODO: should we stop observing the ymap when no one is subscribing?
      };
    },
    set: (...args) => ymap.set(...args),
    has: (...args) => ymap.has(...args),
    get: (...args) => ymap.get(...args),
  };
};
