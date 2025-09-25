import type { Node, Extension } from "@tiptap/core";
export type NodeAsExtension<T> = Node<T> & Extension;
