import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

// get languages id from an url with a file name on its path
export const getLanguageFromUrl = (url) => {
  const extension = url.split(".").pop();
  const languages = monaco.languages.getLanguages();
  const language = languages.find((lang) =>
    lang.extensions.includes("." + extension)
  );
  return language ? language.id : "plaintext";
};
