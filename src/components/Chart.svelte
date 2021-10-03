<script>
  import Box from "./Box";
  import { tick } from "svelte";
  import { sessionData } from "../stores";
  import { userState } from "../states";
  import { getOptions, getChart } from "../chart";

  const lastData = $sessionData[$sessionData.length - 1];

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

<Box class="w-3/5 mx-auto m-8 relative p-8">
  <p
    class="absolute top-8 right-8 text-right cursor-pointer text-lg font-bold"
    on:click={closeChart}
  >
    ↩️ Play another round
  </p>
  <div class="w-full">
    <div class="flex">
      <div class="text-center">
        <p>Accuracy</p>
        <span class="text-4xl font-bold">{lastData?.accuracy}</span>
      </div>
      <div class="ml-16 text-center">
        <p>Wpm</p>
        <span class="text-4xl font-bold">{lastData?.wpm}</span>
      </div>
    </div>
  </div>

  <canvas class="mt-8" id="chart-session" />
</Box>
