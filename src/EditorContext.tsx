import React, { createContext, useContext } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
const EditorContext = createContext<{ editor: TiptapEditor | null }>({ editor: null });
export const useEditorContext = () => useContext(EditorContext);
export const EditorProvider: React.FC<{ editor: TiptapEditor | null; children: React.ReactNode }> = ({ editor, children }) => {
  return <EditorContext.Provider value={{ editor }}>{children}</EditorContext.Provider>;
};