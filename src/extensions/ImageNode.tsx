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
  // Use responsive width with max-width constraint
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Ensure attributes are set for responsive behavior
    if (!node.attrs.width || !node.attrs.height || !node.attrs.maxWidth) {
      updateAttributes({ 
        width: "100%", 
        height: "auto",
        maxWidth: 400 // Default max-width in pixels
      });
    }
  };

  let width = node.attrs.width || "100%"; // Responsive width
  let height = "auto"; // Always auto height for proper aspect ratio
  let maxWidth = node.attrs.maxWidth || 400; // Configurable max-width
  const currentWidth = maxWidth; // Use maxWidth as the resizable dimension
  const isFullWidth = width === "100%"; // Check if responsive mode
  return (
    <div
      className="my-4 flex justify-center w-full"
      data-node-view-wrapper
      style={{ width: "100%" }}
    >
      <ResizableBox
        width={currentWidth}
        height="auto"
        minWidth={200}
        minHeight={30}
        maxWidth={800}
        aspectRatio={true}
        selected={!!selected}
        onResize={({ width, height }) => updateAttributes({ maxWidth: width, width: "100%", height: "auto" })}
      >
        {({ dragging }: { dragging: boolean }) => (
          <div style={{ width: "100%", maxWidth: `${maxWidth}px` }}>
            <img
              src={node.attrs.src}
              alt={node.attrs.alt || ""}
              title={node.attrs.title || ""}
              width="100%"
              height="auto"
              onLoad={handleImageLoad}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                pointerEvents: dragging ? "none" : undefined,
              }}
            />
          </div>
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
      width: { default: "100%" },
      height: { default: "auto" },
      maxWidth: { default: 400 },
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
            
            // Handle async uploads without blocking the handler
            const handleUploads = async () => {
              try {
                // Upload all files and wait for all uploads to complete
                const uploadPromises = Array.from(files).map(async (file) => {
                  try {
                    const url = await upload(file);
                    return url;
                  } catch (error) {
                    console.warn('Failed to upload file:', file.name, error);
                    return null;
                  }
                });
                
                const uploadedUrls = await Promise.all(uploadPromises);
                const validUrls = uploadedUrls.filter(url => url !== null);
                
                if (validUrls.length === 0) return;
                
                // Create a single transaction for all images
                const { state } = view;
                const { tr } = state;
                let { from } = state.selection;
                
                // Insert images one after another
                validUrls.forEach((url, index) => {
                  const node = state.schema.nodes.imageNode.create({ src: url });
                  tr.insert(from + index, node);
                });
                
                view.dispatch(tr.scrollIntoView());
              } catch (error) {
                console.warn('Error handling file drop:', error);
              }
            };
            
            // Start the async operation but don't wait for it
            handleUploads();
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