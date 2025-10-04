import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../EditorContext";

interface Props {
  items: any[];
  range?: { from: number; to: number };
}

export const SlashMenu: React.FC<any> = (props) => {
  const { editor } = useEditorContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; placeAbove: boolean }>({ top: 0, left: 0, placeAbove: false });
  const MENU_HEIGHT = 240; // px

  useEffect(() => {
    if (!editor || !props.range) return;
    const { from } = props.range;
    const start = editor.view.coordsAtPos(from);
    const menuWidth = 320;
    const padding = 8;
    const viewportHeight = window.innerHeight;
    let top = start.bottom + window.scrollY;
    let left = start.left + window.scrollX;
    let placeAbove = false;

    // If not enough space below, place above
    if (top + MENU_HEIGHT + padding > viewportHeight) {
      top = start.top + window.scrollY - MENU_HEIGHT;
      placeAbove = true;
    }

    // Prevent menu from going off right edge
    if (left + menuWidth > window.innerWidth - padding) {
      left = window.innerWidth - menuWidth - padding;
    }

    setPosition({ top, left, placeAbove });
  }, [editor, props.range, props.items?.length]);

  // Click outside to close

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        props.command?.('close');
        // Remove the '/' trigger character if present at the cursor
        if (editor) {
          const { state, commands } = editor;
          const { selection } = state;
          const pos = selection.from;
          const prevChar = state.doc.textBetween(pos - 1, pos);
          if (prevChar === '/') {
            commands.deleteRange({ from: pos - 1, to: pos });
          }
        }
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [props.command, editor]);

  if (!editor) return null;

  return (
    <div
      ref={menuRef}
      className="slash-menu"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 1000,
        width: "320px",
        maxHeight: MENU_HEIGHT,
        minHeight: 120,
        overflowY: "auto",
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        boxShadow: "0 4px 24px 0 #0000001a",
        padding: 4,
        transition: "box-shadow 0.15s",
      }}
    >
      {props.items.map((item: any, idx: number) => (
        <button
          key={idx}
          type="button"
          className="slash-menu-item"
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "8px 12px",
            border: "none",
            background: "none",
            cursor: "pointer",
            borderRadius: 6,
            fontSize: 15,
            marginBottom: 2,
            transition: "background 0.12s",
          }}
          onClick={() => {
            item.command({ editor, range: props.range });
          }}
        >
          <span style={{ marginRight: 8 }}>{item.icon}</span>
          {item.title}
        </button>
      ))}
    </div>
  );
};
