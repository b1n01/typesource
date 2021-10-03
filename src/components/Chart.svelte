<script>
  import Chart from "chart.js/auto";
  import { tick } from "svelte";
  import { sessionData, showChart } from "../stores";

  const chartColors = {
    sessions: "#e07a5f",
    wpm: "#f2cc8f",
    accuracy: "#81b29a",
    x: "#666",
    legend: "#999",
  };

  const chartOptions = {
    animation: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          color: chartColors.legend,
        },
        grid: {
          color: chartColors.x,
          borderColor: chartColors.x,
        },
      },
      yWpm: {
        title: {
          display: true,
          text: "Words per minute",
          color: chartColors.wpm,
        },
        position: "left",
        ticks: {
          color: chartColors.wpm,
        },
        grid: {
          borderColor: chartColors.wpm,
          drawOnChartArea: false,
        },
      },
      yAccuracy: {
        title: {
          display: true,
          text: "Accuracy",
          color: chartColors.accuracy,
        },
        position: "right",
        ticks: {
          color: chartColors.accuracy,
        },
        grid: {
          borderColor: chartColors.accuracy,
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#FFF",
          padding: 32,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        titleAlign: "center",
        bodySpacing: 8,
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
        callbacks: {
          label: (context) => {
            // Format each tooltip label
            let label = context.dataset.label;
            label = " " + label; // add left space
            return label + ": " + context.parsed.y;
          },
          title: () => null,
        },
      },
    },
  };

  function initChart(canvas, series, labels) {
    return new Chart(canvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "wpm",
            data: series.wpm,
            backgroundColor: chartColors.wpm,
            borderColor: chartColors.wpm,
            tension: 0.3,
            yAxisID: "yWpm",
          },
          {
            label: "accuracy",
            data: series.acc,
            backgroundColor: chartColors.accuracy,
            borderColor: chartColors.accuracy,
            tension: 0.3,
            yAxisID: "yAccuracy",
          },
        ],
      },
      options: chartOptions,
    });
  }

  tick().then(() => {
    let series = { wpm: [], acc: [] };
    let labels = [];

    $sessionData.forEach((data, key) => {
      series.wpm.push(data.wpm);
      series.acc.push(data.accuracy);
      labels.push(key + 1);
    });

    const canvas = document.getElementById("chart").getContext("2d");
    initChart(canvas, series, labels);
  });

  const closeChart = () => ($showChart = false);
</script>

<div class="w-1/2 mx-auto mt-16 relative">
  <h1 class="text-white text-xl font-bold">Last session stats</h1>
  <span class="absolute top-0 right-0 cursor-pointer" on:click={closeChart}>
    ❌
  </span>
  <canvas class="mt-8" id="chart" />
</div>
