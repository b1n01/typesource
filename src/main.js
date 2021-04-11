import "./global.css";
import "tailwindcss/tailwind.css";
import { init as timer } from "./timer";
import { init as metrics } from "./metrics";
import App from "./components/App.svelte";

timer();
metrics();
const app = new App({ target: document.body });

export default app;
