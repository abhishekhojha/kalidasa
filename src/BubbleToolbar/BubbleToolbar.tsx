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


export const BubbleToolbar: React.FC<BubbleToolbarProps> = ({ buttons = [] }) => {
  const { editor } = useEditorContext();
  const [position, setPosition] = useState<
    { top: number; left: number; placeAbove: boolean; positionMode: 'center' | 'left' | 'right' }
    | null
  >(null);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(false);

  // After first render, measure and update position
  useEffect(() => {
    if (!editor) return;
    const updatePosition = () => {
      if (!editor || editor.state.selection.empty) {
        setPosition(null);
        return;
      }
      const { from, to } = editor.state.selection;
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const selectionLeft = Math.min(start.left, end.left);
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
      // Always align left to selection
      let left = selectionLeft + window.scrollX;
      let maxToolbarWidth = viewportWidth - 2 * padding;
      let width = toolbarWidth;
      if (toolbarWidth > maxToolbarWidth) {
        width = maxToolbarWidth;
      }
      const minLeft = padding;
      const maxLeft = viewportWidth - width - padding;
      left = Math.min(Math.max(left, minLeft), maxLeft);
      setPosition({
        top,
        left,
        placeAbove,
        positionMode: 'left',
      });
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
    editor.on('selectionUpdate', updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      editor.off('selectionUpdate', updatePosition);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [editor, measured]);

  if (!editor || editor.state.selection.empty || !position) return null;
  const typedEditor = editor as StarterKitEditor;

  return (
    <div
      ref={toolbarRef}
      className="bubble-toolbar"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000,
        maxWidth: 'calc(100vw - 16px)',
        width: 'auto',
        overflowX: 'auto',
        overflow: 'visible',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'top 0.15s, left 0.15s',
        visibility: measured ? 'visible' : 'hidden',
        transform: 'none',
      }}
  data-place-above={position.placeAbove} data-position-mode={position.positionMode}
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
              className={`bubble-button ${isActive ? 'active' : ''} ${btn.className ?? ''}`}
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
