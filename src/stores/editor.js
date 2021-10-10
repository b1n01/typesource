import { writable } from "svelte/store";
import { getStore } from "../ystores";

export const position = writable({ lineNumber: 1, column: 1 }); // player cursor position
export const fileUrl = getStore("file", ""); // the url of the selected file
