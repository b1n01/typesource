<script>
  import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
  } from "firebase/firestore";
  import { tick, onDestroy } from "svelte";
  import { db } from "../firebase";
  import { user } from "../stores";
  import Loader from "./Loader.svelte";
  import Box from "./Box.svelte";
  import Chart from "chart.js/auto";

  let loading = true; // whether is fetching data from the db
  let isEmpty = false; // wheter there are no data to display
  let todayStats = []; // stats to be rendered whith today data
  let totalStats = []; // stats to be rendered with total data
  let today = new Date().toLocaleDateString("en-US");

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
      // ySessions: {
      //   title: {
      //     display: true,
      //     text: "Number of sessions",
      //     color: chartColors.sessions,
      //   },
      //   ticks: {
      //     color: chartColors.sessions,
      //   },
      //   grid: {
      //     borderColor: chartColors.sessions,
      //     drawOnChartArea: false,
      //   },
      // },
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
          title: (context) => {
            // Format tooltip title date
            let date = new Date(context[0].label);
            let options = {
              year: "numeric",
              month: "short",
              day: "numeric",
            };
            return date.toLocaleDateString("en-US", options);
          },
        },
      },
    },
  };

  // Get empty stats
  function initStats() {
    return {
      sessions: 0,
      wpm: 0,
      acc: 0,
      today: {
        sessions: 0,
        wpm: 0,
        acc: 0,
      },
    };
  }

  // Create the chart
  function initChart(canvas, series, labels) {
    return new Chart(canvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          // {
          //   label: "sessions",
          //   data: sessionsDataset,
          //   backgroundColor: chartColors.sessions,
          //   borderColor: chartColors.sessions,
          //   tension: 0.3,
          //   yAxisID: "ySessions",
          // },
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

  // When the user is ready fetch data from DB
  const unsubscribeUser = user.subscribe(async () => {
    if ($user) {
      loading = true;
      const metricsColl = collection(db, "metrics");
      const select = query(
        metricsColl,
        where("uid", "==", $user.uid),
        orderBy("timestamp")
      );
      const metrics = await getDocs(select);

      // Set loading to false and wait a tick to let svelte
      // draw the html to then render the chart
      loading = false;
      isEmpty = false;
      await tick();

      calculateStats(metrics);
      drawChart(metrics);
    }
  });

  // Calculates statistics from user metrics and puts them into todayStats and totalStats
  const calculateStats = (metrics) => {
    let stats = initStats();
    let totals = initStats();

    metrics.forEach((metrics) => {
      let metric = metrics.data();
      let time = metric.timestamp.toDate();
      let metricDate = new Date(time).toLocaleDateString("en-US");

      totals.sessions++;
      totals.wpm += metric.wpm;
      totals.acc += metric.accuracy;

      if (metricDate == today) {
        totals.today.sessions++;
        totals.today.wpm += metric.wpm;
        totals.today.acc += metric.accuracy;
      }
    });

    if (totals.sessions) {
      stats.sessions = totals.sessions;
      stats.wpm = Math.round(totals.wpm / totals.sessions);
      stats.acc = Math.round(totals.acc / totals.sessions);
    }

    if (totals.today.sessions) {
      stats.today.sessions = totals.today.sessions;
      stats.today.wpm = Math.round(totals.today.wpm / totals.today.sessions);
      stats.today.acc = Math.round(totals.today.acc / totals.today.sessions);
    }

    totalStats = [
      { label: "Total sessions", content: stats.sessions },
      { label: "Total wpm", content: stats.wpm },
      { label: "Total accuracy", content: stats.acc + "%" },
    ];

    todayStats = [
      { label: "Today sessions", content: stats.today.sessions },
      { label: "Today wpm", content: stats.today.wpm },
      { label: "Today accuracy", content: stats.today.acc + "%" },
    ];
  };

  // Render the chart
  const drawChart = (metrics) => {
    if (metrics.size == 0) {
      // Is no metrics show empty state and do not try to run the chart
      // otherwise will get an error because the canvcas is not rendered
      isEmpty = true;
      return;
    }

    let series = { sessions: [], wpm: [], acc: [] };
    let labels = [];
    let dates = {};

    // Group metrics by bate
    metrics.forEach((metricData) => {
      let metric = metricData.data();
      let time = metric.timestamp.toDate();
      let date = new Date(time).toLocaleDateString("en-US");

      let stats = { accuracy: metric.accuracy, wpm: metric.wpm };
      dates[date] ? dates[date].push(stats) : (dates[date] = [stats]);
    });

    // Add data to the datasets for the chart
    for (let day in dates) {
      let stats = dates[day];
      let sessions = stats.length;
      let wpm = stats.reduce((sum, stat) => sum + stat.wpm, 0);
      let accuracy = stats.reduce((sum, stat) => sum + stat.accuracy, 0);

      labels.push(day);
      series.sessions.push(sessions);
      series.wpm.push(sessions ? Math.round(wpm / sessions) : 0);
      series.acc.push(sessions ? Math.round(accuracy / sessions) : 0);
    }

    const canvas = document.getElementById("chart").getContext("2d");
    initChart(canvas, series, labels);
  };

  // TODO check this
  onDestroy(() => unsubscribeUser());
</script>

<div class="p-8 w-full">
  {#if loading}
    <span class="h-32 flex justify-center items-center">
      <Loader />
    </span>
  {:else}
    <div>
      <div class="flex w-full">
        <Box class="mr-2 w-1/2 flex items-center justify-between">
          {#each todayStats as data}
            <div class="px-10 border-l-2 first:border-0 border-border">
              <p>{data.label}</p>
              <p class="mt-4 text-3xl font-bold">{data.content}</p>
            </div>
          {/each}
        </Box>
        <Box class="ml-2 w-1/2 flex items-center justify-between">
          {#each totalStats as data}
            <div class="px-10 border-l-2 first:border-0 border-border">
              <p>{data.label}</p>
              <p class="mt-4 text-3xl font-bold">{data.content}</p>
            </div>
          {/each}
        </Box>
      </div>
      <Box class="my-5 px-32 pt-8">
        {#if isEmpty}
          <p>
            No data to show 😳. Play some sessions to start gather usefull data!
          </p>
        {:else}
          <canvas id="chart" />
        {/if}
      </Box>
    </div>
  {/if}
</div>
