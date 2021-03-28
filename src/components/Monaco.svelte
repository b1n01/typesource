<script>
	import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import { tick } from 'svelte';

    tick().then(() => {
        monaco.editor.create(document.getElementById('monaco'), {
            value: 'console.log("Hello")',
            language: 'javascript'
        })
    })
</script>

<main>
	<div class="w-96 h-96" id='monaco'></div>
</main>

<style>
</style>