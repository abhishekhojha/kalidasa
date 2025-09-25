// extensions/Embeds.ts
import { Node, mergeAttributes, nodePasteRule, type Command } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Plugin, PluginKey } from "prosemirror-state";
import React from "react";
import { Tweet } from "react-tweet";

// -------------------- YouTube --------------------
export interface YoutubeOptions {
  HTMLAttributes: Record<string, any>;
}

function convertYouTube(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

const YouTubeComponent = ({ node }: { node: any }) => {
  return (
    <div className="my-4 flex justify-center">
      <iframe
        width={560}
        height={315}
        src={node.attrs.src}
        title="YouTube video player"
        frameBorder={0}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};

export const Youtube = Node.create<YoutubeOptions>({
  name: "youtube",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      src: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "iframe[src]" }];
  },
  renderHTML({ node }) {
    return ["iframe", mergeAttributes(node.attrs)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(YouTubeComponent);
  },
  addCommands() {
    return {
      setYoutube:
        (options: { src: string }): Command =>
        ({ commands }) => {
          const src = convertYouTube(options.src.trim());
          return commands.insertContent({ type: this.name, attrs: { src } });
        },
    };
  },
  addPasteRules() {
    return [
      nodePasteRule({
        find: /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/gi,
        type: this.type,
        getAttributes: (match) => ({ src: convertYouTube(match[0]) }),
      }),
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("youtube-drop"),
        props: {
          handleDrop: (view, event) => {
            const data =
              event.dataTransfer?.getData("text/plain") ||
              event.dataTransfer?.getData("text/uri-list");
            if (!data) return false;
            if (data.includes("youtube.com") || data.includes("youtu.be")) {
              const src = convertYouTube(data);
              const { from, to } = view.state.selection;
              const node = view.state.schema.nodes.youtube.create({ src });
              view.dispatch(view.state.tr.replaceRangeWith(from, to, node).scrollIntoView());
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});

// -------------------- Twitter/X --------------------
const TWITTER_REGEX =
  /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/status\/([0-9]+)/i;

const TweetComponent = ({ node }: { node: any }) => {
  const src = node.attrs.src as string;
  const id = src.match(TWITTER_REGEX)?.[1];
  if (!id) return <p>Invalid Tweet</p>;

  return (
    <div className="my-4 flex justify-center" data-twitter>
      <Tweet id={id} />
    </div>
  );
};

export const Twitter = Node.create({
  name: "twitter",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: "div[data-twitter]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-twitter": "" }, HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TweetComponent);
  },
  addCommands() {
    return {
      setTweet:
        (options: { src: string }): Command =>
        ({ commands }) => {
          if (!TWITTER_REGEX.test(options.src)) return false;
          return commands.insertContent({ type: this.name, attrs: { src: options.src } });
        },
    };
  },
  addPasteRules() {
    return [
      nodePasteRule({
        find: TWITTER_REGEX,
        type: this.type,
        getAttributes: (match) => ({ src: match[0] }),
      }),
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("twitter-drop"),
        props: {
          handleDrop: (view, event) => {
            const data =
              event.dataTransfer?.getData("text/plain") ||
              event.dataTransfer?.getData("text/uri-list");
            if (data && TWITTER_REGEX.test(data)) {
              const { from, to } = view.state.selection;
              const node = view.state.schema.nodes.twitter.create({ src: data });
              view.dispatch(view.state.tr.replaceRangeWith(from, to, node).scrollIntoView());
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});
