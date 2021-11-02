import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

// Define custom mapping for non supported file extensions
const customLanguages = {
  svelte: "javascript",
  vue: "javascript",
};

// get languages id from an url with a file name on its path
export const getLanguageFromUrl = (url) => {
  const extension = url.split(".").pop();
  if (customLanguages[extension]) {
    return customLanguages[extension];
  } else {
    const languages = monaco.languages.getLanguages();
    const language = languages.find((lang) =>
      lang.extensions.includes("." + extension)
    );
    return language ? language.id : "plaintext";
  }
};
