<script>
	import Nav from './Nav.svelte'
	import StatusBar from './StatusBar.svelte'
	import Editor from './Editor.svelte'
	import Explorer from './Explorer.svelte'
	// import Match from './Match.svelte'
</script>

<Nav />
<section class="container mx-auto">
	<section class="flex">
		<section class="w-3/5 m-4">
			<StatusBar />
		</section>
		<section class="w-2/5 m-4"><!-- placeholder --></section>
	</section>
	<section class="flex">
		<section class="w-3/5 ml-8 mr-4">
			<Editor />
		</section>
		<section class="w-2/5 mr-8 ml-4">
			<section>
				<Explorer />
			</section>
			<!-- 
			<section class="mt-8">
				<Match /> 
			</section>
			-->
		</section>
	</section>
</section>