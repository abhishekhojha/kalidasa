import React, { useEffect, useState } from "react";
// BubbleMenu is a Tiptap extension, not a React component. Remove this import.
import { type Editor as TiptapEditor } from "@tiptap/react";
import { useEditorContext } from "../EditorContext";

// Generic editor type for StarterKit commands
export type StarterKitEditor = TiptapEditor & {
  chain: () => ReturnType<TiptapEditor["chain"]> & {
    toggleBold: () => ReturnType<TiptapEditor["chain"]>;
    toggleItalic: () => ReturnType<TiptapEditor["chain"]>;
    toggleStrike: () => ReturnType<TiptapEditor["chain"]>;
    toggleLink: (options?: {
      href?: string;
    }) => ReturnType<TiptapEditor["chain"]>;
  };
};

// Button type
export interface BubbleToolbarButton {
  label: React.ReactNode;
  command?: (editor: StarterKitEditor) => void;
  isActive?: (editor: StarterKitEditor) => boolean;
  className?: string;
  tooltip?: string;
  submenu?: BubbleToolbarButton[]; // allow submenu to be passed in
}

// Toolbar props
interface BubbleToolbarProps {
  buttons?: BubbleToolbarButton[];
}

export const BubbleToolbar: React.FC<BubbleToolbarProps> = ({
  buttons = [],
}) => {
  const { editor } = useEditorContext();
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    placeAbove: boolean;
    positionMode: "center" | "left" | "right";
  } | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(false);

  // After first render, measure and update position
  useEffect(() => {
    if (!editor) return;
    const updatePosition = () => {
      // Hide toolbar if editor loses focus or selection is empty
      const isFocused = editor?.view.hasFocus();
      if (!editor || editor.state.selection.empty || !isFocused) {
        setPosition(null);
        return;
      }
      const { from, to } = editor.state.selection;
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const selectionLeft = Math.min(start.left, end.left);
      const selectionRight = Math.max(start.right, end.right);
      const selectionCenter = (selectionLeft + selectionRight) / 2;
      const toolbarHeight = toolbarRef.current?.offsetHeight || 40;
      const toolbarWidth = toolbarRef.current?.offsetWidth || 200;
      const padding = 8;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      let top = start.top - toolbarHeight - padding + window.scrollY;
      let placeAbove = true;
      if (start.top - toolbarHeight - padding < 0) {
        top = end.bottom + padding + window.scrollY;
        placeAbove = false;
      }
      if (!placeAbove && top + toolbarHeight > viewportHeight) {
        top = viewportHeight - toolbarHeight - padding;
      }
      // Center toolbar above selection if possible
      let left = selectionCenter - toolbarWidth / 2 + window.scrollX;
      let positionMode: "center" | "left" | "right" = "center";
      const minLeft = padding;
      const maxLeft = viewportWidth - toolbarWidth - padding;
      if (left < minLeft) {
        left = minLeft;
        positionMode = "left";
      } else if (left > maxLeft) {
        left = maxLeft;
        positionMode = "right";
      }
      setPosition({
        top,
        left,
        placeAbove,
        positionMode,
      });
      setTimeout(() => {
        updatePosition()
      }, 0);
    };
    // First render: let toolbar render offscreen, then measure
    if (!measured) {
      setTimeout(() => {
        setMeasured(true);
        updatePosition();
      }, 0);
    } else {
      updatePosition();
    }
    editor.on("selectionUpdate", updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    // Click outside to close toolbar
    function handleDocumentClick(event: MouseEvent) {
      const toolbarEl = toolbarRef.current;
      const editorEl = editor?.view.dom;
      if (!toolbarEl || !editorEl) return;
      if (
        !toolbarEl.contains(event.target as Node) &&
        !editorEl.contains(event.target as Node)
      ) {
        setPosition(null);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      editor.off("selectionUpdate", updatePosition);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [editor, measured]);

  if (!editor || editor.state.selection.empty || !position) return null;
  const typedEditor = editor as StarterKitEditor;

  return (
    <div
      ref={toolbarRef}
      className="bubble-toolbar"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 1000,
        maxWidth: "calc(100vw - 16px)",
        width: "auto",
        overflowX: "auto",
        overflow: "visible",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        transition: "top 0.15s, left 0.15s",
        visibility: measured ? "visible" : "hidden",
        transform: "none",
      }}
      data-place-above={position.placeAbove}
      data-position-mode={"position.positionMode"}
    >
      {buttons.map((btn, idx) => {
        const isActive = btn.isActive?.(typedEditor);
        const hasSubmenu = btn.submenu && btn.submenu.length > 0;
        return (
          <div key={idx} className="bubble-toolbar-item">
            <button
              onClick={() => {
                if (hasSubmenu) {
                  setOpenSubmenu(openSubmenu === idx ? null : idx);
                } else {
                  btn.command?.(typedEditor);
                  setOpenSubmenu(null);
                }
              }}
              className={`bubble-button ${isActive ? "active" : ""} ${
                btn.className ?? ""
              }`}
              title={btn.tooltip}
            >
              {btn.label}
            </button>
            {hasSubmenu && openSubmenu === idx && (
              <div className="bubble-submenu">
                {btn.submenu!.map((sub, subIdx) => (
                  <button
                    key={subIdx}
                    onClick={() => {
                      sub.command?.(typedEditor);
                      setOpenSubmenu(null);
                    }}
                    className="bubble-submenu-item"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
