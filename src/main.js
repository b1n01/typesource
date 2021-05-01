import "./global.css";
import "tailwindcss/tailwind.css";
import { init as timer } from "./timer";
import { init as metrics } from "./metrics";
import { initializeApp } from "firebase/app";
import App from "./components/App.svelte";

timer();
metrics();
initializeApp({
  apiKey: "AIzaSyC3oY0YGywi1nXOqqlyK6EdBd5JOEUMAx8",
  authDomain: "typesource-d7cc5.firebaseapp.com",
  projectId: "typesource-d7cc5",
  storageBucket: "typesource-d7cc5.appspot.com",
  messagingSenderId: "360526879897",
  appId: "1:360526879897:web:7a06f1c0f590702ed8ac08",
});

const app = new App({ target: document.body });

export default app;
