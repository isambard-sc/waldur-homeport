import { useEffect, useRef } from 'react';

const MONACO_LANGUAGE_PATH_MAP = {
  python: () => import('monaco-editor/esm/vs/basic-languages/python/python.js'),
  yaml: () => import('monaco-editor/esm/vs/basic-languages/yaml/yaml.js'),
  shell: () => import('monaco-editor/esm/vs/basic-languages/shell/shell.js'),
};

export const MonacoEditor = ({
  value,
  onChange,
  language,
  theme,
  height,
  readOnly = false,
}) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadMonacoAndLanguage = async () => {
      const monaco = await import('monaco-editor/esm/vs/editor/editor.api');
      const loader = await MONACO_LANGUAGE_PATH_MAP[language];
      if (loader) {
        const languageModule = await loader();
        monaco.languages.register({ id: language });
        monaco.languages.setMonarchTokensProvider(
          language,
          languageModule.language,
        );
      }

      if (containerRef.current) {
        // Dispose previous instance if it exists
        if (editorRef.current) {
          editorRef.current.dispose();
        }

        // Create new editor instance
        editorRef.current = monaco.editor.create(containerRef.current, {
          value: value || '',
          language,
          theme,
          minimap: { enabled: false },
          automaticLayout: true,
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          readOnly,
        });

        // Add change event listener
        editorRef.current.onDidChangeModelContent(() => {
          onChange?.(editorRef.current.getValue());
        });
      }
    };
    loadMonacoAndLanguage();

    // Cleanup
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []); // Empty dependency array as we want this to run once

  return (
    <div ref={containerRef} style={{ width: '100%', height: `${height}px` }} />
  );
};
