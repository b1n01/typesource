<script>
  import {
    selectedFile,
    language,
    timer,
    elapsed,
    correctChars,
    typedChars,
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
    <p>file: {$selectedFile?.name || ""}</p>
    <p>lang: {$language || ""}</p>
    <p>state: {$state.value}</p>
    <p>elapsed: {$elapsed}</p>
    <p>timer: {$timer}</p>
    <p>typed chars: {$typedChars.length}</p>
    <p>correct chars: {$correctChars}</p>
    <p>
      accuracy: {$typedChars.length
        ? Math.round(($correctChars / $typedChars.length) * 100) + "%"
        : "-"}
    </p>
    <p>wpm: {$elapsed ? Math.floor(($correctChars / 5 / $elapsed) * 60) : 0}</p>
  {:else}
    <p class="cursor-pointer" on:click={toggle}>
      Debug<span class="ml-4">⬆️</span>
    </p>
  {/if}
</section>
