<script>
  import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
  import { tick } from "svelte";
  import {
    fileContent,
    fileUrl,
    correctChars,
    language as fileLanguage,
    typedChars,
  } from "../stores.js";
  import { state } from "../states";
  import monacoConfig from "../monaco.config";

  let editor = null; // the editor
  let decorations = []; // decoration to gray out the content not already
  let position = { lineNumber: 1, column: 1 }; // initial position of the cusror

  // Reset position to 1, 1
  const resetPosition = () => (position = { lineNumber: 1, column: 1 });

  // Create the editor with custom theme
  const createEditor = () => {
    monaco.editor.defineTheme(monacoConfig.customTheme, monacoConfig.theme);
    editor = monaco.editor.create(
      document.getElementById("monaco"),
      monacoConfig.editor
    );
  };

  // This function updatedes the decoration (grayed out text)
  const updateDecoration = () => {
    decorations = editor.deltaDecorations(decorations, [
      {
        options: { inlineClassName: "grayedOut" },
        range: new monaco.Range(
          position.lineNumber,
          position.column,
          10000,
          10000
        ),
      },
    ]);
  };

  // Hide 'cannot edit in read-only editor' tooltip
  // see https://github.com/microsoft/monaco-editor/issues/1742#issuecomment-571908392
  const hideReadOnlyTooltip = () => {
    const messageContribution = editor.getContribution(
      "editor.contrib.messageController"
    );
    editor.onDidAttemptReadOnlyEdit(() => messageContribution.closeMessage());
  };

  // Reload custom font sizing when the font is fetched
  // see https://github.com/microsoft/monaco-editor/issues/648#issuecomment-564978560
  const remeasureFonts = (delay = 350) => {
    setTimeout(monaco.editor.remeasureFonts, delay);
  };

  // Update editor language when fileUrl changes
  const updateLanguage = () => {
    const extension = $fileUrl.split(".").pop();
    const languages = monaco.languages.getLanguages();
    const language = languages.find((lang) =>
      lang.extensions.includes("." + extension)
    );
    const languageId = language ? language.id : "plaintext";
    monaco.editor.setModelLanguage(editor.getModel(), languageId);
    fileLanguage.set(languageId);
  };

  // Update editor value with fileContent
  const updateContent = () => {
    editor.getModel().setValue($fileContent);
    resetPosition();
  };

  // Only let cursor position to be updated from `api` or by human if the
  // state is `inactive` or `stopped`
  const preventPositionChange = () => {
    editor.onDidChangeCursorPosition((e) => {
      if (
        ["inactive", "stopped"].includes($state.value) ||
        e.source === "api"
      ) {
        position = editor.getPosition();
      } else {
        editor.setPosition(position);
      }
    });
  };

  // On focus set state active
  const handleFocus = () => {
    // editor.onDidFocusEditorText(() => {
    // });
  };

  // On blur set state paused
  const handleBlur = () => {
    editor.onDidBlurEditorText(() => {
      state.send("PAUSE");
    });
  };

  // Catch user keypress and check if the cursor should move
  const handleTyping = () => {
    editor.onKeyDown((e) => {
      // Find out next character
      let nextChar = editor.getModel().getValueInRange({
        startColumn: position.column,
        endColumn: position.column + 1,
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
      });

      // If the user typed the correct character move one position to the right
      if (nextChar === e.browserEvent.key) {
        position.column++;
        editor.setPosition(position);
        updateDecoration();
        correctChars.update((n) => n + 1);
        state.send("START");
      }

      // Update typed characters
      if ($state.value === "active") typedChars.update((n) => n + 1);

      // If we are at the end of the line and the Enter is pressed
      // than go on next line
      if (!nextChar && e.browserEvent.key === "Enter") {
        position.lineNumber++;

        // Find out first non whitespace position on next line
        let lineText = editor.getModel().getLineContent(position.lineNumber);
        let firstNotWhiteSpace = lineText.match(/\S/);
        let culumn = firstNotWhiteSpace ? firstNotWhiteSpace.index : 1;
        position.column = culumn + 1;
        editor.setPosition(position);
      }
    });
  };

  tick().then(() => {
    // Create the editor with default theme
    createEditor();

    // Hide 'cannot edit in read-only editor' tooltip
    hideReadOnlyTooltip();

    // Reload custom font sizing when the font is fetched
    remeasureFonts();

    // Only let cursor position to be changed from api
    preventPositionChange();

    // Catch user keypress and check if the cursor should move
    handleTyping();

    // Set active state when the editor gets focus
    handleFocus();

    // Set state as paused on editor blur
    handleBlur();
  });

  // Update editor value when fileContent changes
  $: editor && $fileContent && updateContent();

  // Update editor language when fileUrl changes
  $: editor && $fileUrl && updateLanguage();
</script>

<div class="autoHeight p-8 rounded bg-float">
  <div class="h-full w-full" id="monaco" />
</div>

<style>
  .autoHeight {
    height: calc(100vh - 128px); /* full height minus header and margins */
  }
</style>
