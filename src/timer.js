import { get } from "svelte/store";
import { elapsed, interval, timer } from './stores'
import { state } from './states'

// Update timer (`00:00`) with the new elapsed time since last session start
const updateTimer = () => {
    let time = get(elapsed) + 1
    let minutes = Math.floor(time / 60) % 60;
    let minutesString = minutes.toString().padStart(2, '0')
    time -= minutes * 60;
    let seconds = time % 60
    let secondsString = seconds.toString().padStart(2, '0')
    let formatted = `${minutesString}:${secondsString}`
    
    timer.set(formatted)
    elapsed.set(time)
}

// Initialize the Timer to automatically start/pausa/stop the timer 
// when the state changes.
export const init = () => {
    state.subscribe(state => {
        switch (state.value) {
            case 'active':
                start()
            break;
            case 'paused':
                pause()
                break;
            case 'stop':
            default:
                stop()
            break;
        }
    })
}

// Start the timer
export const start = () => {
    interval.set(setInterval(updateTimer, 1000))
}

// Pause the timer
export const pause = () => {
    clearInterval(get(interval))
}

// Stop the timer
export const stop = () => {
    timer.set('00:00')
    elapsed.set(0)
    clearInterval(get(interval))
}