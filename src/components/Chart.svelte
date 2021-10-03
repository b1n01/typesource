<script>
  import { tick } from "svelte";
  import { sessionData } from "../stores";
  import { userState } from "../states";
  import { getOptions, getChart } from "../chart";

  tick().then(() => {
    const canvas = document.getElementById("chart-session");
    let series = { wpm: [], acc: [] };
    let labels = [];

    $sessionData.forEach((data, key) => {
      series.wpm.push(data.wpm);
      series.acc.push(data.accuracy);
      labels.push(key + 1);
    });

    getChart(canvas, series, labels, getOptions());
  });

  const closeChart = () => {
    $sessionData = [];
    userState.send("RESET");
  };
</script>

<div class="w-1/2 mx-auto mt-16 relative">
  <h1 class="text-white text-xl font-bold">Last session stats</h1>
  <span class="absolute top-0 right-0 cursor-pointer" on:click={closeChart}>
    ❌
  </span>
  <canvas class="mt-8" id="chart-session" />
</div>
