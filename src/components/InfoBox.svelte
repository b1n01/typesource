<script>
  import { timer, metrics, elapsed } from "../stores";
  import { userState } from "../states";

  let showTimer = true;
  setInterval(() => {
    showTimer = $userState.matches("offline.paused") ? !showTimer : true;
  }, 1000);

  let displayWpm = "-";
  let displayAccuracy = "-";
  let canUpdate = false;

  // We wand to update the infobox once per second, so we use canUpdate as
  // a traffic light: when we update the info we than set it to false, but
  // every time $elapsed changes (every second) we set canUpdate to true
  $: {
    // Just set true each time $elapse changes (each second)
    canUpdate = $elapsed || true;
  }

  $: if (canUpdate) {
    canUpdate = false;
    displayWpm = $metrics.wpm || "-";
    displayAccuracy = $metrics.accuracy ? `${$metrics.accuracy}%` : "-";
  }
</script>

<div class="text-white mx-4 flex justify-between">
  <div class="flex flex-col text-center">
    <span class="text-opacity-70 text-sm">accuracy</span>
    <span class="text-xl font-mono">{displayAccuracy}</span>
  </div>
  <span class="my-2 border border-border" />
  <div class="flex flex-col text-center">
    <span class="text-opacity-70 text-sm">wpm</span>
    <span class="text-xl font-mono">{displayWpm}</span>
  </div>
  <span class="my-2 border border-border" />
  <div class="flex flex-col text-center">
    <span class="text-opacity-70 text-sm">
      time {$userState.matches("offline.paused") ? "⏸️" : ""}
    </span>
    <span class="text-xl font-mono">
      {showTimer ? $timer : $timer.replace(":", " ")}
    </span>
  </div>
</div>
