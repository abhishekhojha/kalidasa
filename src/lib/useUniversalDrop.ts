// src/lib/useUniversalDrop.ts
// Universal drag-and-drop handler for Tiptap/ProseMirror extensions
// Usage: Pass an array of drop handlers, each with a predicate and a handler function

export type UniversalDropHandler = {
  predicate: (data: DataTransfer, event: DragEvent) => boolean;
  handle: (view: any, event: DragEvent, data: DataTransfer) => boolean;
};

export function createUniversalDropPlugin(handlers: UniversalDropHandler[], { Plugin, PluginKey }: any, keyName: string) {
  return new Plugin({
    key: new PluginKey(keyName),
    props: {
      handleDrop(view: any, event: DragEvent) {
        const data = event.dataTransfer;
        if (!data) return false;
        for (const { predicate, handle } of handlers) {
          if (predicate(data, event)) {
            return handle(view, event, data);
          }
        }
        return false;
      },
    },
  });
}
