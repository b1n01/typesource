<script>
  import { collection, query, where, getDocs } from "firebase/firestore";
  import { db } from "../firebase";
  import { user } from "../stores";
  import Loader from "./Loader.svelte";
  import Box from "./Box.svelte";

  let loading = true; // whether is fetching data from the db
  let totalSessions = 0;
  let totalAvgWpm = 0;
  let totalAvgAccuracy = 0;

  let todaySessions = 0;
  let todayAvgWpm = 0;
  let todayAvgAccuracy = 0;

  user.subscribe(async () => {
    if ($user) {
      const metricsColl = collection(db, "metrics");
      const select = query(metricsColl, where("uid", "==", $user.uid));
      const results = await getDocs(select);

      let today = new Date();
      let totalWpm = 0;
      let totalAccuracy = 0;
      let todayWpm = 0;
      let todayAccuracy = 0;

      results.forEach((metricSnap) => {
        let metric = metricSnap.data();

        totalSessions++;
        totalWpm += metric.wpm;
        totalAccuracy += metric.accuracy;

        let metricDate = new Date(metric.timestamp.toDate());
        if (
          metricDate.toLocaleDateString("en-US") ==
          today.toLocaleDateString("en-US")
        ) {
          todaySessions++;
          todayWpm += metric.wpm;
          todayAccuracy += metric.accuracy;
        }
      });

      if (totalSessions) {
        totalAvgWpm = Math.round(totalWpm / totalSessions);
        totalAvgAccuracy = Math.round(totalAccuracy / totalSessions);
      }

      if (todaySessions) {
        todayAvgWpm = Math.round(todayWpm / todaySessions);
        todayAvgAccuracy = Math.round(todayAccuracy / todaySessions);
      }

      loading = false;
    }
  });
</script>

<div class="p-8 w-full">
  {#if loading}
    <span class="h-32 flex justify-center items-center">
      <Loader />
    </span>
  {:else}
    <div class="flex w-full">
      <Box class="mr-2 w-1/2">
        <h1 class="text-white">Today statistics</h1>
        <p>session: {todaySessions}</p>
        <p>average words per minutes: {todayAvgWpm}</p>
        <p>average accuracy: {todayAvgAccuracy}</p>
      </Box>
      <Box class="ml-2 w-1/2">
        <h1 class="text-white">Overall statistics</h1>
        <p>session: {totalSessions}</p>
        <p>average words per minutes: {totalAvgWpm}</p>
        <p>average accuracy: {totalAvgAccuracy}</p>
      </Box>
    </div>
    <Box class="my-4 w-full">Trend Chart</Box>
  {/if}
</div>
