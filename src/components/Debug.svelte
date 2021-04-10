<script>
  import {
    selectedFile,
    language,
    timer,
    elapsed,
    typedChars,
  } from "../stores";
  import { state } from "../states";
  let show = true;
  const toggle = () => (show = !show);
</script>

<section
  class="text-white bg-gray-900 bg-opacity-90 p-2 absolute bottom-2 left-2 text-sm opacity-50"
>
  {#if show}
    <p class="flex justify-between cursor-pointer" on:click={toggle}>
      Debug<span>❌</span>
    </p>
    <p>file: {$selectedFile?.name || ""}</p>
    <p>language: {$language || ""}</p>
    <p>state: {$state.value}</p>
    <p>elapsed: {$elapsed}</p>
    <p>timer: {$timer}</p>
    <p>correct characters: {$typedChars}</p>
    <p>wpm: {$elapsed ? Math.floor(($typedChars / 5 / $elapsed) * 60) : 0}</p>
  {:else}
    <p class="cursor-pointer" on:click={toggle}>
      Debug<span class="ml-4">⬆️</span>
    </p>
  {/if}
</section>
