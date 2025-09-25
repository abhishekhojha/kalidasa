import React from "react";
import { useEditorContext } from "../EditorContext";

interface Props {
  items: any[];
  range?: { from: number; to: number };
}

export const SlashMenu: React.FC<Props> = ({ items, range }) => {
  const { editor } = useEditorContext();

  if (!editor) return null;

  return (
    <div className="slash-menu">
      {items.map((item, idx) => (
        <button
          key={idx}
          type="button"
          className="slash-menu-item"
          onClick={() => {
            item.command({ editor, range }); // pass editor & range
          }}
        >
          <span style={{ marginRight: 8 }}>{item.icon}</span>
          {item.title}
        </button>
      ))}
    </div>
  );
};
