<script>
  export let visible = false;
  let propClass = "";
  export { propClass as class }; // use like `class="class-to-add"`
</script>

{#if visible}
  <div class="fixed inset-0 bg-gray-900 bg-opacity-70 z-10">
    <div
      class="mx-auto pt-12 relative flex min-w-lg max-w-screen-2x {propClass}"
    >
      <slot />
    </div>
  </div>
{/if}
