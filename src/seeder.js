import { get } from "svelte/store";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { user } from "./stores";

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Seed db
export const seedDB = () => {
  if (get(user) && !get(user).isAnonymous) {
    for (let i = 0; i < 300; i++) {
      const metrics = {
        wpm: random(0, 160),
        accuracy: random(0, 100),
        typedChars: [],
        correctChars: 0,
        uid: get(user).uid,
        timestamp: new Date(2021, random(0, 11), random(1, 28)),
      };
      addDoc(collection(db, "metrics"), metrics);
    }
    console.log("DB seeded");
  } else {
    console.error(
      "Not going to seed DB because user is not logged or is anonymous"
    );
  }
};
