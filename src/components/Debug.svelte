<script>
  import {
    timer,
    elapsed,
    correctChars,
    typedChars,
    rounds,
    wpm,
    accuracy,
    position,
    players,
    fileUrl,
    user,
  } from "../stores";
  import { getLanguageFromUrl } from "../utils";
  import { userState } from "../states";

  let show = false;
  const toggle = () => (show = !show);
</script>

<section
  class="text-white bg-gray-900 p-2 fixed bottom-6 right-2 text-sm max-w-xs"
>
  {#if show}
    <p class="flex justify-between cursor-pointer pb-2" on:click={toggle}>
      Debug<span>❌</span>
    </p>
    <p>uid: {$user?.uid || ""}</p>
    <p>file: {$fileUrl.split("/").pop() || ""}</p>
    <p>lang: {getLanguageFromUrl($fileUrl)}</p>
    <p>editor state: {JSON.stringify($userState.value)}</p>
    <p>elapsed: {$elapsed}</p>
    <p>timer: {$timer}</p>
    <p>typed chars: {$typedChars.length}</p>
    <p>correct chars: {$correctChars}</p>
    <p>accuracy: {$accuracy}</p>
    <p>wpm: {$wpm}</p>
    <p>rounds: {$rounds}</p>
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
