import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { useNotebook } from "../../context";

type Props = { id: string; readOnly?: boolean; type: string };

export default function BlockType({ id = "", readOnly = false, type = "" }: Props) {
  const { blocks, dispatcher } = useNotebook();
  const currentBlockIcon = ((blocks as any[]).find((block) => block.type === type) || {}).icon;
  const handleBlockTypeSelection = (blockType: string) => {
    dispatcher({ type: "block-type-conversion", id, oldBlockType: type, newBlockType: blockType });
  };
  const renderBlockType = (blockType: any) => (
    <DropdownMenuItem
      key={`${id}-${blockType.type}`}
      className="flex items-center justify-between py-2"
      disabled={blockType.type === type}
      onSelect={() => handleBlockTypeSelection(blockType.type)}
    >
      <div className="flex items-center">
        <span className="text-xs font-mono mr-2 w-6 text-center">{blockType.icon}</span>
        <span className="flex-grow font-medium">{blockType.label}</span>
      </div>
      <DropdownMenuShortcut>{blockType.shortcut}</DropdownMenuShortcut>
    </DropdownMenuItem>
  );
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={readOnly === true}
            className={`flex items-center justify-center w-9 h-9 min-w-[2rem] min-h-[2rem] text-muted-foreground hover:text-accent-foreground hover:bg-accent rounded cursor-pointer self-start ${readOnly === true ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
          >
            <span className="font-mono text-xs">{currentBlockIcon}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>{blocks.map((blockType) => renderBlockType(blockType))}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
