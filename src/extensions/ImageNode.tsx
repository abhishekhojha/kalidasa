import { Node, mergeAttributes, type Command } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";

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

export const ImageNode = Node.create<ImageNodeOptions>({
  name: "imageNode",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
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
      new Plugin({
        key: new PluginKey("image-drop"),
        props: {
          handleDrop(view, event) {
            const files = event.dataTransfer?.files;
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
      }),
    ];
  },
});