import * as Y from "yjs";

// Ydoc shared instance
export const ydoc = new Y.Doc();

// `ystores` are Svelte stores (see https://svelte.dev/docs#Store_contract)
// that wraps Yjs maps (https://github.com/y-js/y-map).
// Use it like:
// import { getStore } from '../ystores';
// const message = getStore('message', 'Default value');
// $message = 'New message';
// const content = $message;

/**
 * Implement the Svlete store contract to wrap a primitive type
 * @param {string} key An identidier for the Ydoc
 * @param {*} init Initial value
 * @returns {Object}
 */
export const getStore = (key, init = undefined) => {
  let handlers = [];
  const ymap = ydoc.getMap(key);

  // When the ymap changes update all local subscribers
  ymap.observe(() => handlers.forEach((handler) => handler(ymap.get(key))));

  return {
    subscribe: (handler) => {
      // When someone subscribe pass it the map value (or the initial value
      // if the map is not already set) and add the subcriber function to the
      // list of handlers
      handler(ymap.has(key) ? ymap.get(key) : init);
      handlers.push(handler);

      // Return the unsubscriber function
      return () => {
        const index = handlers.indexOf(handler);
        if (index !== -1) handlers.splice(index, 1);
      };
    },
    set: (value) => ymap.set(key, value),
  };
};
