<script>
	  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import { tick } from 'svelte';
    let editor
    const bgColor = '#283548'

    monaco.editor.defineTheme('typesource-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        // see https://microsoft.github.io/monaco-editor/playground.html#customizing-the-appearence-exposed-colors
        colors: {
            'editor.background': bgColor, 
            'editor.selectionBackground': bgColor, // selected text color
            'editorWhitespace.foreground': bgColor, // whitespace dots color
            'scrollbar.shadow': bgColor, // hide top shadow
            'editor.inactiveSelectionBackground': bgColor, // hide selection when editor has no hocus
        },
    });

    tick().then(() => {
      editor = monaco.editor.create(document.getElementById('monaco'), {
            value: `((window) => {
  const core = window.Deno.core;
  const { Listener, Conn } = window.__bootstrap.net;

  function opConnectTls(
    args,
  ) {
    return core.jsonOpAsync("op_connect_tls", args);
  }

  function opAcceptTLS(rid) {
    return core.jsonOpAsync("op_accept_tls", { rid });
  }

  function opListenTls(args) {
    return core.jsonOpSync("op_listen_tls", args);
  }

  function opStartTls(args) {
    return core.jsonOpAsync("op_start_tls", args);
  }}`,
            // see https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandaloneeditorconstructionoptions.html
            readOnly: true,
            automaticLayout: true, // automaticaaly resize
            language: 'javascript',
            fontFamily: 'Fira Code',
	          fontSize: 14,
            theme: 'typesource-theme',
            minimap: { enabled: false }, // hide minimap
            scrollbar: { vertical: 'hidden', horizontal: 'hidden' }, // hide scrollbars
            acceptSuggestionOnCommitCharacter: false, // dont accept suggestions on provider defined character
            acceptSuggestionOnEnter: 'off', // dont accept suggestions on ENTER 
            lineNumbers: 'off', // hide line numbers
            codeLens: false, // code preview
            contextmenu: false, // right click menu
            folding: false, // arrows to fold code
            links: false, // disable links
            matchBrackets: 'never', // disable brackets highlighting,
            occurrencesHighlight: false, // disable semantic occurrences highlight
            overviewRulerBorder: false, // hide right ruler border
            overviewRulerLanes: 0, // hide right ruler
            quickSuggestions: false, // disable quick suggestions
            renderFinalNewline: false, // dont add a final new line
            renderIndentGuides: false, // hide indent guide
            renderLineHighlight: 'none', // disable rendering of current line highligh
            renderValidationDecorations: false, // disable validation decorations
            revealHorizontalRightPadding: 0, // remove cursor padding
            scrollBeyondLastColumn: 0, // dont scroll after last column
            scrollBeyondLastLine: false, // dont scroll beyond last line
            selectionHighlight: false, // disable selection
            showDeprecated: false, // hide deprecation hits
            showUnused: false, // hide unused hits
            snippetSuggestions: 'none', // hide snippets
            tabCompletion: false, // disable tab completion
            wordBasedSuggestions: false, // disable suggestions based on content words
            wordWrap: 'wordWrapColumn',
            parameterHints: { enabled: false },
            lightbulb: { enabled: false }, // disable lightbulb suggestions
            hover: { enabled: false }, // hide hover tips
        })

          // Hide 'cannot edit in read-only editor' tooltip
          // see https://github.com/microsoft/monaco-editor/issues/1742#issuecomment-571908392
          const messageContribution = editor.getContribution('editor.contrib.messageController');
          editor.onDidAttemptReadOnlyEdit(messageContribution.closeMessage)
    })

    setTimeout(() => {
      // Reload custom font sizing when the font is fetched
      // see https://github.com/microsoft/monaco-editor/issues/648#issuecomment-564978560
      monaco.editor.remeasureFonts()
    }, 1000)

</script>

<div class="autoHeight p-8 rounded bg-float">
    <div class="h-full w-full" id='monaco'></div>
</div>

<style>
  .autoHeight {
    height: calc(100vh - 128px); /* full height minu header and margins*/ 
  }
</style>