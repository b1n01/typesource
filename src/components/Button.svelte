<script>
  export let label = ""; // button text
  export let danger = false; // use a 'danger' style
  export let disabled = false; // use 'disable' style

  // Trick to expose "class" prop, see https://github.com/sveltejs/svelte/issues/2870#issuecomment-498359180
  let propClass = "";
  export { propClass as class }; // use like `class="class-to-add"`

  let style = "";
  if (disabled) {
    style = "bg-gray-700 border-gray-700 text-gray-400 cursor-default";
  } else if (danger) {
    style = "bg-red-800 border-red-800 hover:bg-red-700";
  } else {
    style = "bg-highlight border-border hover:bg-border";
  }
</script>

<button
  class="border py-2 px-4 rounded focus:outline-none {style} {propClass}"
  on:click
>
  {label}
</button>
