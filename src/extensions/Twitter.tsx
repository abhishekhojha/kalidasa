import { mergeAttributes, Node, nodePasteRule } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { Plugin, PluginKey } from "prosemirror-state";
import { createUniversalDropPlugin } from "../lib/useUniversalDrop";
import React from "react";
import { Tweet } from "react-tweet";

// Regex to detect Twitter/X status URLs (for paste rules - needs global flag)
const TWITTER_PASTE_REGEX =
  /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/status\/([0-9]+)/gi;

// Regex for testing/matching (non-global for reuse)
const TWITTER_REGEX =
  /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/status\/([0-9]+)/i;

const TweetComponent = ({ node }: { node: any }) => {
  const src = node.attrs.src as string;
  const id = src.match(TWITTER_REGEX)?.[1];

  if (!id) {
    return (
      <NodeViewWrapper as="div" className="my-4 flex justify-center" data-twitter>
        <p>Invalid Tweet</p>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="div" className="my-4 flex justify-center" data-twitter>
      <Tweet id={id} />
    </NodeViewWrapper>
  );
};

// ---- Module augmentation for TS ----
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    twitter: {
      setTweet: (options: { src: string }) => ReturnType;
    };
  }
}

// ---- Twitter Extension with Drop ----
export const Twitter = Node.create({
  name: "twitter",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-twitter]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-twitter": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TweetComponent);
  },

  addCommands() {
    return {
      setTweet:
        (options: { src: string }) =>
        ({ commands }) => {
          if (!TWITTER_REGEX.test(options.src)) return false;

          return commands.insertContent({
            type: this.name,
            attrs: { src: options.src },
          });
        },
    };
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: TWITTER_PASTE_REGEX,
        type: this.type,
        getAttributes: (match) => ({ src: match[0] }),
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
              return !!text && TWITTER_REGEX.test(text);
            } catch (error) {
              console.error("Twitter predicate error:", error);
              return false;
            }
          },
          handle: (view, event, data) => {
            try {
              const text = data.getData("text/plain") || data.getData("text/uri-list");
              if (!text || !TWITTER_REGEX.test(text)) return false;
              // Use the extension command to insert tweet
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.twitter.create({ src: text })
                ).scrollIntoView()
              );
              return true;
            } catch (error) {
              console.error("Twitter handle error:", error);
              return false;
            }
          },
        },
      ], { Plugin, PluginKey }, "twitter-drop"),
    ];
  },
});
