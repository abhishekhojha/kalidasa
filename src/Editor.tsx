// Editor.tsx
import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import type { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorProvider } from "./EditorContext";
import {SlashCommand} from "./SlashCommand/SlashCommand";
import "./App.css";
import { Youtube } from "./extensions/Youtube";
import { Twitter } from "./extensions/Twitter";
import { ImageNode } from "./extensions/ImageNode";
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

export interface EditorHandle {
  getHTML: () => string;
  setContent: (content: string) => void;
  clear: () => void;
  chain: () => ReturnType<TiptapEditor["chain"]>;
}

interface EditorProps {
  extensions?: Extension[];
  placeholder?: string;
  onUpdate?: (content: string) => void;
  children?: React.ReactNode;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(
  ({ extensions = [], placeholder = "Write here...", onUpdate, children }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        TaskList,
        TaskItem,
        Youtube,
        Twitter,
        Placeholder.configure({ placeholder }),
        SlashCommand,
        ...extensions
      ],
      content: "",
      immediatelyRender: false, // Fix SSR hydration error for Next.js
      onUpdate: ({ editor }) => onUpdate?.(editor.getHTML()),
    });

    useImperativeHandle(
      ref,
      () => ({
        getHTML: () => editor?.getHTML() ?? "",
        setContent: (content: string) => editor?.commands.setContent(content),
        clear: () => editor?.commands.clearContent(),
        chain: () => editor!.chain(),
      }),
      [editor]
    );

    useEffect(() => () => editor?.destroy(), [editor]);

    if (!editor) return null;

    return (
      <EditorProvider editor={editor}>
        <EditorContent editor={editor} className="prose kali-editorcontent" />
        {editor && children}
      </EditorProvider>
    );
  }
);