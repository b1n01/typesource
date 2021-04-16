<script>
  export let label = ""; // button text
  export let danger = false; // use a 'danger' style
  let propClass = "";
  export { propClass as class }; // use like `class="class-to-add"`
</script>

<button
  class="border py-2 px-4 rounded focus:outline-none {danger
    ? 'bg-red-800 border-red-800 hover:bg-red-700'
    : 'bg-highlight border-border hover:bg-border'} {propClass}"
  on:click
>
  {label}
</button>
