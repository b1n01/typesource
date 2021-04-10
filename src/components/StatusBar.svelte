<script>
  import { state, selectedFile, language } from "../stores.js";
</script>

<section class="text-white text-right text-sm pr-2">
  {#if $selectedFile}
    <span class="mr-3 pr-3 border-r-2 border-border"
      >file: <span
        class="font-bold overflow-hidden overflow-ellipsis inline-block align-bottom max-w-xs"
        >{$selectedFile?.name || ""}</span
      ></span
    >
    <span class="mr-3 pr-3 border-r-2 border-border"
      >language: <span class="font-bold">{$language || ""}</span></span
    >
    <span class="mr-3 pr-3 border-r-2 border-border"
      >state: <span class="font-bold">{$state}</span></span
    >
  {:else}
    <span>Select a file ↘️</span>
  {/if}
</section>
