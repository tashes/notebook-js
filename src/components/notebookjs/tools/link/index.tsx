import { Link } from "lucide-react";
import React from "react";

export default {
  component: (props: any) => {
    const { contentState, entityKey, children } = props;
    const data = contentState.getEntity(entityKey).getData();
    function isMacPlatform() {
      // modern userAgentData
      if ((navigator as any).userAgentData) return (navigator as any).userAgentData.platform === "macOS";
      return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
    }
    const handleClick = (e: React.MouseEvent) => {
      if (isMacPlatform()) {
        if ((e as any).metaKey) window.open(data.url, data.target || "_self");
      } else {
        if ((e as any).ctrlKey) window.open(data.url, data.target || "_self");
      }
    };
    return (
      <div className="relative group/link inline-block z-10" onClick={handleClick}>
        <div className="border border-border bg-muted rounded-md px-2 py-1 mx-1 inline-block cursor-pointer hover:bg-accent">{props.children}</div>
        <div contentEditable={false} className="absolute left-1/2 -translate-x-1/2 mt-2 w-max whitespace-nowrap bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none">
          Left Click + {isMacPlatform() ? "⌘" : "Ctrl"} to open link
        </div>
      </div>
    );
  },
  styles: [{ name: "LINK", styles: {} }],
  constants: ["NON-PERSISTENT", "IMMUTABLE"],
  data: (selectedText: string) => ({ url: selectedText, target: "_self" }),
  label: "Link",
  icon: <Link />,
};

