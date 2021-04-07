const bgColor = '#283548'
const customTheme = 'typesource-theme' // the name of the custom theme

export default {
    customTheme: customTheme, 
    theme: {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            // see https://microsoft.github.io/monaco-editor/playground.html#customizing-the-appearence-exposed-colors
            'editor.background': bgColor, 
            'editor.selectionBackground': bgColor, // selected text color
            'editorWhitespace.foreground': bgColor, // whitespace dots color
            'scrollbar.shadow': bgColor, // hide top shadow
            'editor.inactiveSelectionBackground': bgColor, // hide selection when editor has no hocus
        },
    },
    editor: {
        // see https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandaloneeditorconstructionoptions.html
        readOnly: true,
        theme: customTheme,
        automaticLayout: true, // automaticaly resize
        fontFamily: 'Fira Code', // default font family
        fontSize: 14, // sefault font size
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
    },
}