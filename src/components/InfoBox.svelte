<script>
  import { timer, accuracy, wpm, elapsed } from "../stores";
  import { state } from "../states";

  let showTimer = true;
  setInterval(() => {
    showTimer = $state.value === "paused" ? !showTimer : true;
  }, 1000);

  $: items = [
    {
      label: `time ${$state.value === "paused" ? "⏸️" : ""}`,
      data: showTimer ? $timer : $timer.replace(":", " "),
    },
    { label: "wpm", data: $wpm || "-" },
    { label: "accuracy", data: $accuracy ? `${$accuracy}%` : "-" },
  ];
</script>

<div class="text-white mx-4 flex justify-between">
  {#each items as item, index}
    <div class="flex flex-col text-center">
      <span class="text-opacity-70 text-sm">{item.label}</span>
      <span class="text-xl font-mono">{item.data}</span>
    </div>
    {#if index !== items.length - 1}
      <span class="my-2 border border-border" />
    {/if}
  {/each}
</div>
