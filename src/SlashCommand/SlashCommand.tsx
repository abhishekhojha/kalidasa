import Suggestion from "@tiptap/suggestion";
import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import { SlashMenu } from "./SlashMenu";
import { slashCommands } from "./slashCommands";

export const SlashCommand = Extension.create({
  name: "slash-command",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: true,

        // Use separated command list
        items: ({ query }: { query: string }) =>
          slashCommands.filter(item =>
            item.title.toLowerCase().startsWith(query.toLowerCase())
          ),

        render: () => {
          let component: ReactRenderer | null = null;

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(SlashMenu, { props, editor: props.editor });
              document.body.appendChild(component.element);
            },
            onUpdate: (props: any) => component?.updateProps(props),
            onExit: () => component?.destroy(),
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },
});
