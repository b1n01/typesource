import { writable } from 'svelte/store'

export const fileContent = writable('') // the contetnt of the selected file
export const selectedFile = writable(null) // the selected file