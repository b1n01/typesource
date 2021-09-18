import { get } from "svelte/store";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { user } from "./stores";

const random = (min = 0, max = 1) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Seed db
export const seedDB = async () => {
  if (get(user) && !get(user).isAnonymous) {
    let slack = 15;
    let prevWpm = 35;
    let prevAccuracy = 80;

    // Seed some data in the past
    let date = new Date("01/01/2021");
    for (let i = 0; i < random(200, 400); i++) {
      let wpm = random(prevWpm - slack, prevWpm + slack);
      let accuracy = random(
        prevAccuracy - slack,
        Math.min(100, prevAccuracy + slack)
      );

      // Go to next day only some times
      if (Math.round(random(0, 55) / 100)) {
        date.setDate(date.getDate() + 1);
      }

      const metrics = {
        wpm: wpm,
        accuracy: accuracy,
        typedChars: [],
        correctChars: 0,
        uid: get(user).uid,
        timestamp: date,
      };
      await addDoc(collection(db, "metrics"), metrics);
    }

    // Seed some data for today
    for (let i = 0; i < random(1, 30); i++) {
      let wpm = random(prevWpm - slack, prevWpm + slack);
      let accuracy = random(
        prevAccuracy - slack,
        Math.min(100, prevAccuracy + slack)
      );

      const metrics = {
        wpm: wpm,
        accuracy: accuracy,
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
