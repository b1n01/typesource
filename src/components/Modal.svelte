<script>
  export let visible = false;
</script>

{#if visible}
  <div class="fixed inset-0 bg-gray-900 bg-opacity-70 z-10">
    <div class="mx-auto pt-12 relative flex min-w-lg max-w-screen-2xl">
      <slot />
    </div>
  </div>
{/if}
