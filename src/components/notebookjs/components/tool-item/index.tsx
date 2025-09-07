import { OrderedSet } from "immutable";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  tool: any;
  currentStyles: OrderedSet<string>;
  toggleFn: (opts: { tool: any; styles: string[] }) => Promise<void> | void;
};

export default function ToolItem({ tool = {}, currentStyles = OrderedSet<string>([]), toggleFn = async () => {} }: Props) {
  const [showGroup, setShowGroup] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  useEffect(() => () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); }, []);
  const isActive = (tool.styles || []).map((style: any) => style.name).some((style: string) => currentStyles.has(style));
  const currentlyOnStyles = (tool.styles || []).map((style: any) => style.name).filter((style: string) => currentStyles.has(style));
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isActive) await toggleFn({ tool, styles: currentlyOnStyles });
    else if ((tool.styles || []).length > 0) await toggleFn({ tool, styles: [...currentlyOnStyles, tool.styles[0].name] });
  };
  const handleSpecificToggle = async (e: React.MouseEvent, style: any) => {
    e.preventDefault();
    await toggleFn({ tool, styles: [...currentlyOnStyles, style.name] });
  };
  const handleMouseEnter = () => { if (timeoutRef.current) { window.clearTimeout(timeoutRef.current); timeoutRef.current = null; } setShowGroup(true); };
  const handleMouseLeave = () => { timeoutRef.current = window.setTimeout(() => { setShowGroup(false); timeoutRef.current = null; }, 300); };
  const createToolItem = (style: any) => {
    const isActiveSubItem = currentStyles.has(style.name);
    return (
      <button key={`${tool.label}-${style.name}`} className={`rounded cursor-pointer outline-none hover:scale-[1.5] transition-all duration-100 ${isActiveSubItem ? "ring-2 ring-ring" : "border border-border"}`} onClick={(e) => handleSpecificToggle(e, style)}>
        <div className="w-4 h-4 flex items-center justify-center scale-100">{style.icon}</div>
      </button>
    );
  };
  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button onClick={handleToggle} className={`p-1 rounded cursor-pointer hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-opacity-50 ${isActive ? `bg-accent` : ""}`}>
        <div className="w-4 h-4 flex items-center justify-center scale-100">{tool.icon}</div>
      </button>
      {tool.constants?.some((constant: string) => constant === "GROUP") && showGroup && (
        <div className="absolute top-[-2.5rem] left-0 mt-0 p-2 bg-popover text-popover-foreground shadow-md rounded-md border border-border flex space-x-2 z-10000" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {(tool.styles || []).map((style: any) => createToolItem(style))}
        </div>
      )}
    </div>
  );
}

