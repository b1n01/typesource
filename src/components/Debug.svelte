<script>
  import {
    timer,
    elapsed,
    keystrokes,
    metrics,
    position,
    players,
    fileUrl,
    user,
  } from "../stores";
  import { getLanguageFromUrl } from "../utils";
  import { userState } from "../states";
  import { seedDB } from "../seeder.js";

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
    <p>typed chars: {$keystrokes.typedChars.length}</p>
    <p>correct chars: {$keystrokes.correctChars}</p>
    <p>accuracy: {$metrics.accuracy}</p>
    <p>wpm: {$metrics.wpm}</p>
    <p>position: {$position.lineNumber}:{$position.column}</p>
    <p>
      players: {$players.map(
        (p) => `[${p.position.lineNumber}:${p.position.column}]`
      )}
    </p>

    <p class="flex justify-between cursor-pointer pb-2 pt-4">Actions</p>
    {#if $user && !$user.isAnonymous}
      <button class="bg-gray-300 rounded px-2 text-black" on:click={seedDB}>
        Seed DB
      </button>
    {:else}
      <button class="bg-gray-600 rounded px-2 text-gray-800 cursor-default">
        Seed DB
      </button>
    {/if}
  {:else}
    <p class="cursor-pointer" on:click={toggle}>
      Debug<span class="ml-4">⬆️</span>
    </p>
  {/if}
</section>
