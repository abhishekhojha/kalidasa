import React, { useState, useEffect } from "react";
import { type Editor as TiptapEditor } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
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
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  // Close submenu when clicking outside
  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (openSubmenu !== null) {
        setOpenSubmenu(null);
      }
    }
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [openSubmenu]);

  if (!editor) return null;
  
  const typedEditor = editor as StarterKitEditor;

  return (
    <BubbleMenu editor={editor} className="bubble-toolbar">
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
              <div 
                className="bubble-submenu"
                onClick={(e) => e.stopPropagation()}
              >
                {btn.submenu!.map((sub, subIdx) => (
                  <button
                    key={subIdx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        sub.command?.(typedEditor);
                      } catch (error) {
                        console.error("Submenu command error:", error);
                      }
                      setOpenSubmenu(null);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
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
    </BubbleMenu>
  );
};
