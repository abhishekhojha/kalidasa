import React from "react";
import { Node, mergeAttributes, type Command, nodePasteRule } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { createUniversalDropPlugin } from "../lib/useUniversalDrop";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableBox } from "../lib/ResizableBox";

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

// YouTube URL regex patterns
// Global version for paste rules (needs global flag for matchAll)
const YOUTUBE_PASTE_REGEX = /https?:\/\/(?:(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)(?:\S+)?/gi;

// Non-global version for testing and matching - handles full URLs
const YOUTUBE_REGEX = /https?:\/\/(?:(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/;

function convertToEmbed(url: string) {
  const watchRegex = YOUTUBE_REGEX;
  const match = url.match(watchRegex);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

interface YouTubeComponentProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  selected?: boolean;
}

const YouTubeComponent: React.FC<YouTubeComponentProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const width = node.attrs.width || 560;
  const height = node.attrs.height || 315;
  let winwidth = window.innerWidth - 20;
  const maxWidth = winwidth;
  const isFullWidth = width === "100%";
  return (
    <div className={`my-4 flex justify-center${isFullWidth ? " w-full" : ""}`} data-node-view-wrapper style={isFullWidth ? { width: "100%" } : {}}>
      <ResizableBox
        width={width}
        height={height}
        minWidth={200}
        minHeight={120}
        maxWidth={maxWidth}
        aspectRatio={true}
        selected={!!selected}
        onResize={({ width, height }) => updateAttributes({ width, height })}
      >
        {({ dragging }: { dragging: boolean }) => (
          <iframe
            width={isFullWidth ? "100%" : width}
            height={height}
            src={node.attrs.src}
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
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

export const Youtube = Node.create<YoutubeOptions>({
  name: "youtube",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: 560 },
      height: { default: 315 },
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

  addNodeView() {
    return ReactNodeViewRenderer(YouTubeComponent);
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

  addPasteRules() {
    return [
      nodePasteRule({
        find: YOUTUBE_PASTE_REGEX,
        type: this.type,
        getAttributes: (match) => {
          const src = convertToEmbed(match[0]);
          return { src };
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      createUniversalDropPlugin([
        {
          predicate: (data) => {
            try {
              const text = data.getData("text/plain") || data.getData("text/uri-list");
              return !!text && YOUTUBE_REGEX.test(text);
            } catch (error) {
              console.error("YouTube predicate error:", error);
              return false;
            }
          },
          handle: (view, event, data) => {
            try {
              const text = data.getData("text/plain") || data.getData("text/uri-list");
              if (!text) return false;
              const src = convertToEmbed(text);
              const { from, to } = view.state.selection;
              const node = view.state.schema.nodes.youtube.create({ src });
              view.dispatch(view.state.tr.replaceRangeWith(from, to, node).scrollIntoView());
              return true;
            } catch (error) {
              console.error("YouTube handle error:", error);
              return false;
            }
          },
        },
      ], { Plugin, PluginKey }, "youtube-drop"),
    ];
  },
});
