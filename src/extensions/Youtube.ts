import { Node, mergeAttributes, type Command } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";

export interface YoutubeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtube: {
      setYoutube: (options: { src: string }) => ReturnType;
    };
  }
}

function convertToEmbed(url: string) {
  const watchRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
  const match = url.match(watchRegex);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

export const Youtube = Node.create<YoutubeOptions>({
  name: "youtube",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: "YouTube video player" },
      frameborder: { default: 0 },
      allow: {
        default:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      },
      allowfullscreen: { default: true },
      referrerpolicy: { default: "strict-origin-when-cross-origin" },
      class: { default: "embed-youtube-video-item" },
    };
  },

  parseHTML() {
    return [{ tag: "iframe[src]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["iframe", mergeAttributes(node.attrs, HTMLAttributes)];
  },

  addCommands() {
    return {
      setYoutube:
        (options: { src: string }): Command =>
        ({ commands }) => {
          const src = convertToEmbed(options.src.trim());

          return commands.insertContent({
            type: this.name,
            attrs: { src },
          });
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("youtube-drop"),
        props: {
          handleDrop: (view, event) => {
            const data = event.dataTransfer?.getData("text/plain");
            if (!data) return false;

            // Check if it's a YouTube URL
            if (data.includes("youtube.com") || data.includes("youtu.be")) {
              const src = convertToEmbed(data);

              // Use Tiptap commands to insert node
              const { state } = view;
              const { tr } = state;
              const { from, to } = state.selection;

              // Insert node manually via transaction
              const node = state.schema.nodes.youtube.create({ src });
              tr.replaceRangeWith(from, to, node);
              view.dispatch(tr.scrollIntoView());

              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});
