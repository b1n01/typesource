import { get } from "svelte/store";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { user } from "./stores";

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Seed db
export const seedDB = async () => {
  if (get(user) && !get(user).isAnonymous) {
    // Seed some data in the past
    for (let i = 0; i < random(150, 400); i++) {
      const metrics = {
        wpm: random(0, 160),
        accuracy: random(0, 100),
        typedChars: [],
        correctChars: 0,
        uid: get(user).uid,
        timestamp: new Date(2021, random(0, 11), random(1, 28)),
      };
      await addDoc(collection(db, "metrics"), metrics);
    }

    // Seed some data for today
    for (let i = 0; i < random(1, 30); i++) {
      const metrics = {
        wpm: random(0, 160),
        accuracy: random(0, 100),
        typedChars: [],
        correctChars: 0,
        uid: get(user).uid,
        timestamp: new Date(),
      };
      await addDoc(collection(db, "metrics"), metrics);
    }

    console.log("DB seeded");
  } else {
    console.error(
      "Not going to seed DB because user is not logged or is anonymous"
    );
  }
};
