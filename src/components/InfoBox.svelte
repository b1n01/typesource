<script>
  import { timer, metrics } from "../stores";
  import { userState } from "../states";
</script>

<div class="text-white mx-4 flex justify-between">
  <div class="flex flex-col text-center">
    <span class="text-opacity-70 text-sm">accuracy</span>
    <span class="text-xl font-mono">{$metrics.wpm || "-"}</span>
  </div>
  <span class="my-2 border border-border" />
  <div class="flex flex-col text-center">
    <span class="text-opacity-70 text-sm">wpm</span>
    <span class="text-xl font-mono">
      {$metrics.accuracy ? `${$metrics.accuracy}%` : "-"}
    </span>
  </div>
  <span class="my-2 border border-border" />
  <div class="flex flex-col text-center">
    <span class="text-opacity-70 text-sm">
      time {$userState.matches("offline.paused") ? "⏸️" : ""}
    </span>
    <span class="text-xl font-mono">{$timer}</span>
  </div>
</div>
