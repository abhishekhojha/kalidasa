import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import './App.css'

export const Editor: React.FC = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello World! ✍️</p>",
  });

  return <EditorContent editor={editor} className="prose kali-editorcontent" />;
};
