import { StarterKitEditor } from "../BubbleToolbar/BubbleToolbar";

function toggleBold(editor: StarterKitEditor) {
  editor.chain().focus().toggleBold?.().run();
}

function toggleItalic(editor: StarterKitEditor) {
  editor.chain().focus().toggleItalic?.().run();
}

function toggleStrike(editor: StarterKitEditor) {
  editor.chain().focus().toggleStrike?.().run();
}

function toggleLink(editor: StarterKitEditor, href: string) {
  editor.chain().focus().toggleLink?.({ href }).run();
}
function aiHelper(editor: StarterKitEditor, output: string) {
  if (!output) return;
  editor.chain().focus().insertContent(output).run();
}

/* -------- 🆕 Turn Into Helpers -------- */
function setParagraph(editor: StarterKitEditor) {
  editor.chain().focus().setParagraph?.().run();
}

function toggleHeading(editor: StarterKitEditor, level: 1 | 2 | 3 | 4 | 5 | 6) {
  editor.chain().focus().toggleHeading?.({ level }).run();
}

function toggleBlockquote(editor: StarterKitEditor) {
  editor.chain().focus().toggleBlockquote?.().run();
}

function toggleBulletList(editor: StarterKitEditor) {
  editor.chain().focus().toggleBulletList?.().run();
}

function toggleOrderedList(editor: StarterKitEditor) {
  editor.chain().focus().toggleOrderedList?.().run();
}

function toggleCodeBlock(editor: StarterKitEditor) {
  editor.chain().focus().toggleCodeBlock?.().run();
}
export {
  toggleBold,
  toggleItalic,
  toggleStrike,
  toggleLink,
  aiHelper,
  setParagraph,
  toggleHeading,
  toggleBlockquote,
  toggleBulletList,
  toggleOrderedList,
  toggleCodeBlock,
};
