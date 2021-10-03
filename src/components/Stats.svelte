<script>
  import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
  } from "firebase/firestore";
  import { tick } from "svelte";
  import { db } from "../firebase";
  import { user } from "../stores";
  import Loader from "./Loader.svelte";
  import Box from "./Box.svelte";
  import { options as baseChartOptions, getChart } from "../chart";

  let loading = true; // whether is fetching data from the db
  let isEmpty = false; // wheter there are no data to display
  let todayStats = []; // stats to be rendered whith today data
  let totalStats = []; // stats to be rendered with total data
  let today = new Date().toLocaleDateString("en-US");

  let chartOptions = baseChartOptions;
  chartOptions.plugins.tooltip.callbacks.title = (context) => {
    // Format tooltip title date
    let date = new Date(context[0].label);
    let options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
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

  // When the user is ready fetch data from DB
  $: if ($user) {
    loading = true;
    const metricsColl = collection(db, "metrics");
    const select = query(
      metricsColl,
      where("uid", "==", $user.uid),
      orderBy("timestamp")
    );

    getDocs(select).then((metrics) => {
      // Set loading to false and wait a tick to let svelte
      // draw the html to then render the chart
      loading = false;
      tick().then(() => {
        calculateStats(metrics);
        drawChart(metrics);
      });
    });
  }

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
      // If no metrics then show empty state and do not try to run the chart
      // otherwise will get an error because the canvas is not rendered
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

    const canvas = document.getElementById("chart");
    getChart(canvas, series, labels, chartOptions);
  };
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
      <Box class="my-5 px-32 py-8">
        {#if isEmpty}
          <div class="text-center my-16">
            <p class="text-2xl mb-4">😞 No enough data to draw the chart</p>
            <p>Play some sessions to start gather useful statistics</p>
          </div>
        {:else}
          <canvas id="chart" />
        {/if}
      </Box>
    </div>
  {/if}
</div>
