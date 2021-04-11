<script>
  import { timer, accuracy, wpm } from "../stores";

  $: items = [
    { label: "time", data: $timer },
    { label: "wpm", data: $wpm || "-" },
    { label: "accuracy", data: $accuracy ? `${$accuracy}%` : "-" },
  ];
</script>

<div class="text-white mb-8 mx-4 flex justify-between">
  {#each items as item, index}
    <div class="flex flex-col text-center">
      <span class="text-opacity-70 text-sm">{item.label}</span>
      <span class="text-xl">{item.data}</span>
    </div>
    {#if index !== items.length - 1}
      <span class="py-4 border border-border last:border-0" />
    {/if}
  {/each}
</div>
