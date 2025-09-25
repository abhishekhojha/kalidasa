import type { Editor, Range } from "@tiptap/core";
import {
  Type,
  Youtube,
  Twitter,
  Code,
  List,
  Quote,
  YoutubeIcon,
  Heading2,
  Heading1,
  Heading3,
  Image as ImageIcon,
  ListOrdered,
} from "lucide-react";
import React from "react";

export interface SlashCommandItem {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

export const slashCommands: SlashCommandItem[] = [
  {
    title: "Paragraph",
    icon: <Type size={16} />,
    description: "Turn text into paragraph",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    icon: <Heading1 size={16} />,
    description: "Turn text into H1",
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run(),
  },
  {
    title: "Heading 2",
    icon: <Heading2 size={16} />,
    description: "Turn text into H2",
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run(),
  },
  {
    title: "Heading 3",
    icon: <Heading3 size={16} />,
    description: "Turn text into H3",
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run(),
  },
  {
    title: "Bullet List",
    icon: <List size={16} />,
    description: "Convert to bullet list",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Ordered List",
    icon: <ListOrdered size={16} />,
    description: "Convert to numbered list",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Blockquote",
    icon: <Quote size={16} />,
    description: "Convert to blockquote",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    icon: <Code size={16} />,
    description: "Insert code block",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "YouTube Embed",
    icon: <YoutubeIcon size={16} />,
    command: ({ editor, range }) => {
      const url = prompt("Enter YouTube URL") || "";
      if (!url) return;
      editor.chain().focus().deleteRange(range).setYoutube({ src: url }).run();
    },
  },
  {
    title: "Twitter Embed",
    icon: <Twitter size={16} />,
    description: "Embed a Tweet",
    command: ({ editor, range }) => {
      const url = prompt("Enter Twitter/X URL") || "";
      if (!url) return;

      editor.chain().focus().deleteRange(range).setTweet({ src: url }).run();
    },
  },
  {
    title: "Image Embed",
    icon: <ImageIcon size={16} />,
    description: "Insert an image",
    command: async ({ editor, range }) => {
      const imageNode = editor.extensionManager.extensions.find(
        (ext) => ext.name === "imageNode"
      ) as any;
      console.log({ imageNode });

      if (!imageNode?.options.upload) {
        const url = prompt("Enter image URL") || "";
        if (!url) return;
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
        return;
      }

      // Create hidden file input to pick image
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        const url = await imageNode.options.upload!(file);
        if (!url) return;

        editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
      };
      input.click();
    },
  },
];
