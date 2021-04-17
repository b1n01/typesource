<script>
  import {
    fileUrl,
    language,
    timer,
    elapsed,
    correctChars,
    typedChars,
    wpm,
    accuracy,
    position,
    players,
  } from "../stores";
  import { state } from "../states";

  let show = false;
  const toggle = () => (show = !show);
</script>

<section class="text-white bg-gray-900 p-2 absolute bottom-2 left-2 text-sm">
  {#if show}
    <p class="flex justify-between cursor-pointer pb-2" on:click={toggle}>
      Debug<span>❌</span>
    </p>
    <p>file: {$fileUrl ? $fileUrl.split("/").pop() : ""}</p>
    <p>lang: {$language || ""}</p>
    <p>state: {$state.value}</p>
    <p>elapsed: {$elapsed}</p>
    <p>timer: {$timer}</p>
    <p>typed chars: {$typedChars.length}</p>
    <p>correct chars: {$correctChars}</p>
    <p>accuracy: {$accuracy}</p>
    <p>wpm: {$wpm}</p>
    <p>position: {$position.lineNumber}:{$position.column}</p>
    <p>
      players: {$players.map(
        (p) => `[${p.position.lineNumber}:${p.position.column}]`
      )}
    </p>
  {:else}
    <p class="cursor-pointer" on:click={toggle}>
      Debug<span class="ml-4">⬆️</span>
    </p>
  {/if}
</section>
