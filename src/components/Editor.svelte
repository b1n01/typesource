<script>
	  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
    import { tick } from 'svelte'
    import { fileContent, selectedFile } from '../stores.js'
    import monacoConfig from '../monaco.config'

    let editor = null
    const customTheme = 'typesource-theme'

    tick().then(() => {
      // Define the custom theme
      monaco.editor.defineTheme(customTheme, monacoConfig.theme)

      // Create the editor
      editor = monaco.editor.create(document.getElementById('monaco'), {
        ...monacoConfig.editor,
        theme: customTheme,
      })

      // Hide 'cannot edit in read-only editor' tooltip
      // see https://github.com/microsoft/monaco-editor/issues/1742#issuecomment-571908392
      const messageContribution = editor.getContribution('editor.contrib.messageController')
      editor.onDidAttemptReadOnlyEdit(messageContribution.closeMessage)

      setTimeout(() => {
        // Reload custom font sizing when the font is fetched
        // see https://github.com/microsoft/monaco-editor/issues/648#issuecomment-564978560
        monaco.editor.remeasureFonts()
      }, 500)
    })

    // Update editor value when fileContent changes
    $: if (editor && $fileContent) editor.getModel().setValue($fileContent)
    
    // Update editor language when selectedFile changes
    $: if (editor && $selectedFile) {
      const extension = $selectedFile.name.split('.').pop()
        const languages = monaco.languages.getLanguages()
        const language = languages.find(lang => lang.extensions.includes('.' + extension))
        const languageId = language ? language.id : 'plaintext'
        monaco.editor.setModelLanguage(editor.getModel(), languageId)
    }
</script>

<div class="autoHeight p-8 rounded bg-float">
    <div class="h-full w-full" id='monaco'></div>
</div>

<style>
  .autoHeight {
    height: calc(100vh - 128px); /* full height minus header and margins */ 
  }
</style>