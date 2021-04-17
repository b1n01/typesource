<script>
  export let value = ""; // input value
  export let placeholder = ""; // the placeholder
  export let readonly = false; // wheter the input is readonly
  let propClass = "";
  export { propClass as class }; // use like `class="class-to-add"`
</script>

<div class="flex bg-highlight border border-border rounded w-full {propClass}">
  <slot name="pre-icon" />
  <input
    bind:value
    on:input
    {placeholder}
    {readonly}
    type="text"
    class="p-2 bg-transparent outline-none w-full"
  />
  <slot name="post-icon" />
</div>
