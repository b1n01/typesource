<script>
  export let label = ""; // button text
  export let onClick = () => {}; // called on click
  let propClass = "";
  export { propClass as class }; // use like `class="class-to-add"`
</script>

<button
  class="bg-highlight border-border border py-2 px-4 rounded focus:outline-none hover:bg-border {propClass}"
  on:click={onClick}
>
  {label}
</button>
