<script>
  // import { showChart } from "../stores";
  // const close = () => ($showChart = false);
</script>

<div class="fixed p-32 top-0 right-0 left-0 bottom-0 bg-background">
  <div
    class="mx-auto relative flex justify-center items-center min-w-lg max-w-screen-2xl h-full"
  >
    <!-- <div class="absolute cursor-pointer right-4 top-4" on:click={close}>❌</div> -->
    <slot />
  </div>
</div>
