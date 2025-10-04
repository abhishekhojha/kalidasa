import { Node, mergeAttributes, type Command } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { createUniversalDropPlugin } from "../lib/useUniversalDrop";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableBox } from "../lib/ResizableBox";
import React from "react";

export interface ImageNodeOptions {
  HTMLAttributes: Record<string, any>;
  /**
   * User-provided function to upload files
   */
  upload?: (file: File) => Promise<string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageNode: {
      setImage: (options: { src: string }) => ReturnType;
    };
  }
}

const ImageNodeComponent: React.FC<any> = ({ node, updateAttributes, selected }) => {
  let width = node.attrs.width || 320;
  let height = node.attrs.height || 180;
  let winwidth = window.innerWidth - 20;
  const maxWidth = winwidth;
  const isFullWidth = width === "100%";
  return (
    <div
      className={`my-4 flex justify-center${isFullWidth ? " w-full" : ""}`}
      data-node-view-wrapper
      style={isFullWidth ? { width: "100%" } : {}}
    >
      <ResizableBox
        width={width}
        height={height}
        minWidth={50}
        minHeight={30}
        maxWidth={maxWidth}
        aspectRatio={true}
        selected={!!selected}
        onResize={({ width, height }) => updateAttributes({ width, height })}
      >
        {({ dragging, isFullWidth }: { dragging: boolean; isFullWidth: boolean }) => (
          <img
            src={node.attrs.src}
            alt={node.attrs.alt || ""}
            title={node.attrs.title || ""}
            width={isFullWidth ? "100%" : width}
            height={height}
            style={{
              maxWidth: "100%",
              width: isFullWidth ? "100%" : width,
              display: "block",
              pointerEvents: dragging ? "none" : undefined,
            }}
          />
        )}
      </ResizableBox>
    </div>
  );
};

export const ImageNode = Node.create<ImageNodeOptions>({
  name: "imageNode",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: 320 },
      height: { default: 180 },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["img", mergeAttributes(node.attrs, HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage:
        (options: { src: string }): Command =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src: options.src },
          });
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    return [
      createUniversalDropPlugin([
        {
          predicate: (data) => {
            const files = data.files;
            return !!files && files.length > 0 && typeof extension.options.upload === "function";
          },
          handle: (view, event, data) => {
            const files = data.files;
            const upload = extension.options.upload;
            if (!files?.length || !upload) return false;
            Array.from(files).forEach(async (file) => {
              const url = await upload(file);
              if (!url) return;
              const { state } = view;
              const { tr } = state;
              const { from, to } = state.selection;
              const node = state.schema.nodes.imageNode.create({ src: url });
              tr.replaceRangeWith(from, to, node);
              view.dispatch(tr.scrollIntoView());
            });
            return true;
          },
        },
      ], { Plugin, PluginKey }, "image-drop"),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeComponent);
  },
});