<script>
    import { state, sessionStar, selectedFile, availableStates, language } from '../stores.js'

    let timer = '00:00' // default timer
    let interval = null // id of the current interval

    // Update timer since last session start
    const updateTimer = () => {
        let delta = Math.floor((Date.now() - $sessionStar) / 1000)
        let minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        let seconds = delta % 60
        timer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    
    // If active immidiately update timer then set interval, otherwise clear interval
    $: if($state === availableStates.active) {
        updateTimer() 
        interval = setInterval(updateTimer, 1000)
    } else {
        clearInterval(interval)
    }
</script>

<section class="text-white text-right text-sm pr-2">
    {#if $selectedFile}
        <span class="mr-3 pr-3 border-r-2 border-border">file: <span class="font-bold overflow-hidden overflow-ellipsis inline-block align-bottom max-w-xs">{$selectedFile?.name || ''}</span></span>
        <span class="mr-3 pr-3 border-r-2 border-border">language: <span class="font-bold">{$language || ''}</span></span>
        <span class="mr-3 pr-3 border-r-2 border-border">state: <span class="font-bold">{$state}</span></span>
        <span>time: <span class="font-bold">{timer}</span></span>
    {:else}
        <span>Select a file ↘️</span>
    {/if}
</section>