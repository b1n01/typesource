<script>
	import Nav from './Nav.svelte'
	import Editor from './Editor.svelte'
	import Explorer from './Explorer.svelte'
	import Debug from './Debug.svelte'
</script>

<Nav />
<section class="container mx-auto flex">
	<section class="w-3/5 m-8 mr-4">
		<Editor />
	</section>
	<section class="w-2/5 m-8 ml-4">
		<section>
			<Explorer />
		</section>
	</section>
</section>
<Debug />