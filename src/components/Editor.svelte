<script>
	  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
    import { tick } from 'svelte'
    import { availableStates, fileContent, selectedFile, typedChars, state, language as fileLanguage } from '../stores.js'
    import monacoConfig from '../monaco.config'

    let editor = null // the editor
    let decorations = [] // decoration to gray out the content not already
    let position = { lineNumber: 1, column: 1 } // initial position of the cusror

    // Reset position to 1, 1
    const resetPosition = () => position = { lineNumber: 1, column: 1 }

    // Create the editor with custom theme
    const createEditor = () => {
      monaco.editor.defineTheme(monacoConfig.customTheme, monacoConfig.theme)
      editor = monaco.editor.create(document.getElementById('monaco'), monacoConfig.editor)
    }

    // This function updatedes the decoration (grayed out text) 
    const updateDecoration = () => {
      decorations = editor.deltaDecorations(decorations, [{
        options: { inlineClassName: 'grayedOut' },
        range: new monaco.Range(position.lineNumber,position.column, 10000, 10000)
      }])
    }

    // Hide 'cannot edit in read-only editor' tooltip
    // see https://github.com/microsoft/monaco-editor/issues/1742#issuecomment-571908392
    const hideReadOnlyTooltip = () => {
      const messageContribution = editor.getContribution('editor.contrib.messageController')
      editor.onDidAttemptReadOnlyEdit(() => messageContribution.closeMessage())
    }

    // Reload custom font sizing when the font is fetched
    // see https://github.com/microsoft/monaco-editor/issues/648#issuecomment-564978560
    const remeasureFonts = (delay = 350) => {
      setTimeout(monaco.editor.remeasureFonts, delay)
    }
    
    // Update editor language when selectedFile changes
    const updateLanguage = () => {
      const extension = $selectedFile.name.split('.').pop()
      const languages = monaco.languages.getLanguages()
      const language = languages.find(lang => lang.extensions.includes('.' + extension))
      const languageId = language ? language.id : 'plaintext'
      monaco.editor.setModelLanguage(editor.getModel(), languageId)
      fileLanguage.set(languageId)
    }

    // Update editor value with fileContent
    const updateContent = () => {
      editor.getModel().setValue($fileContent)
      resetPosition()
    }

    // Only let cursor position to be changed from api
    const preventPositionChange = () => {
      editor.onDidChangeCursorPosition(e => {
        if(e.source !== 'api') editor.setPosition(position)
      })
    }

    // Catch user keypress and check if the cursor should move
    const handleTyping = () => {
      editor.onKeyDown(e => {

        // Find out next character
        let nextChar = editor.getModel().getValueInRange({
          startColumn: position.column,
          endColumn: position.column + 1,
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
        })

        // If the user typed the correct character move one position to the right
        if(nextChar === e.browserEvent.key) {
          position.column++
          editor.setPosition(position)
          updateDecoration()
          typedChars.update(n => n + 1)
        }

        // If we are at the end of the line and the Enter is pressed
        // than go on next line
        if(!nextChar && e.browserEvent.key === 'Enter') {
          position.lineNumber++

          // Find out first non whitespace position on next line
          let lineText = editor.getModel().getLineContent(position.lineNumber)
          let firstNotWhiteSpace = lineText.match(/\S/)
          let culumn = firstNotWhiteSpace ? firstNotWhiteSpace.index : 1
          position.column = culumn + 1
          editor.setPosition(position)
        }
      })
    }

    tick().then(() => {
      // Create the editor with default theme
      createEditor()

      // Hide 'cannot edit in read-only editor' tooltip
      hideReadOnlyTooltip()

      // Gray out text not already typed
      updateDecoration()

      // Reload custom font sizing when the font is fetched
      remeasureFonts()

      // Only let cursor position to be changed from api
      preventPositionChange()

      // Catch user keypress and check if the cursor should move
      handleTyping()

      // Set active state when the editor gets focus
      editor.onDidFocusEditorText(() => {
        state.set(availableStates.active)
      })

      // Set state as paused on editor blur
      editor.onDidBlurEditorText(() => {
        state.set(availableStates.pause)
      })
    })

    // Update editor value when fileContent changes
    $: editor && $fileContent && updateContent()
    
    // Update editor language when selectedFile changes
    $: editor && $selectedFile && updateLanguage()

    // Remove this
    const preview = () => {
      fetch('https://raw.githubusercontent.com/denoland/deno/main/runtime/examples/hello_runtime.js')
        .then(res => res.text())
        .then(data => {
          fileContent.set(data)
          selectedFile.set({ name: 'hello_runtime.js'})
          tick().then(updateDecoration)
        })
    }
</script>

<!-- Remove this -->
<!-- <button on:click={preview} class="bg-highlight text-white border-border border py-2 px-4 rounded focus:outline-none hover:bg-border mb-4">
  Load Preview
</button> -->

<div class="autoHeight p-8 rounded bg-float">
    <div class="h-full w-full" id='monaco'></div>
</div>

<style>
  .autoHeight {
    height: calc(100vh - 128px); /* full height minus header and margins */ 
  }
</style>