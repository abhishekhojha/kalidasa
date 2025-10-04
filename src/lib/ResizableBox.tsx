import React, { useRef, useState } from "react";

interface ResizableBoxProps {
  width: number | "100%";
  height: number | "auto";
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: boolean;
  selected?: boolean;
  onResize: (size: { width: number | "100%"; height: number | "auto" }) => void;
  children: React.ReactNode | ((props: { dragging: boolean; isFullWidth: boolean; setFullWidth: () => void }) => React.ReactNode);
}

export const ResizableBox: React.FC<ResizableBoxProps> = ({
  width,
  height,
  minWidth = 50,
  minHeight = 30,
  maxWidth = 1200,
  maxHeight = 800,
  aspectRatio = false,
  selected = false,
  onResize,
  children,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Track if currently full width
  const isFullWidth = width === "100%";

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    // If width is '100%', convert to pixel width for resizing
    let startWidth = width;
    let startHeight = height;
    if (width === "100%" && boxRef.current) {
      startWidth = boxRef.current.offsetWidth;
      startHeight = boxRef.current.offsetHeight;
      onResize({ width: startWidth, height: startHeight });
    }
    setDragging(true);
    setStart({
      x: e.clientX,
      y: e.clientY,
      width: typeof startWidth === "number" ? startWidth : boxRef.current?.offsetWidth || maxWidth,
      height: typeof startHeight === "number" ? startHeight : boxRef.current?.offsetHeight || maxHeight,
    });
    document.body.style.userSelect = "none";
  };

  React.useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!start) return;
      let newWidth = start.width + (e.clientX - start.x);
      let newHeight = aspectRatio
        ? (newWidth * start.height) / start.width
        : start.height + (e.clientY - start.y);
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      onResize({ width: newWidth, height: newHeight });
    };
    const handleMouseUp = () => {
      setDragging(false);
      setStart(null);
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, start, aspectRatio, minWidth, minHeight, maxWidth, maxHeight, onResize]);

  // Helper to set full width from child
  const setFullWidth = () => onResize({ width: "100%", height: "auto" });

  return (
    <div
      ref={boxRef}
      style={{
        position: "relative",
        width: isFullWidth ? "100%" : width,
        height: height === "auto" ? undefined : height,
        display: "inline-block",
        boxSizing: "border-box",
        border: selected ? "2.5px solid #2563eb" : "2.5px solid transparent",
        boxShadow: selected ? "0 0 0 2px #2563eb33" : undefined,
        borderRadius: 8,
        transition: "border 0.15s, box-shadow 0.15s",
      }}
    >
      {typeof children === "function"
        ? children({ dragging, isFullWidth, setFullWidth })
        : children}
      {selected && (
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 16,
            height: 16,
            background: dragging ? "#3182ce" : "#e2e8f0",
            borderRadius: 4,
            cursor: "nwse-resize",
            zIndex: 10,
            border: "1px solid #3182ce",
          }}
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
};
