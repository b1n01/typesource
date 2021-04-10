import "./global.css";
import "tailwindcss/tailwind.css";
import { init as timer } from "./timer";
import App from "./components/App.svelte";

timer();
const app = new App({ target: document.body });

export default app;
