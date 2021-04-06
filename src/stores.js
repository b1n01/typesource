import { writable } from 'svelte/store'

export const fileContent = writable('') // the content of the selected file
export const selectedFile = writable(null) // the selected file