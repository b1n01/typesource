<script>
  let propClass = "";
  export { propClass as class }; // use like `class="class-to-add"`
</script>

<section class="p-4 rounded bg-float text-white {propClass}">
  <slot />
</section>
