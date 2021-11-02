<script>
  let propClass = "";
  export { propClass as class }; // use like `class="class-to-add"`
</script>

<div class={"flex items-center " + propClass}>
  <span class="animate-spin">⌛</span>
</div>
