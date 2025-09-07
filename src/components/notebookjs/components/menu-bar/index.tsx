import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { ChevronDown, ChevronUp, MoreHorizontal, Trash } from "lucide-react";
import { useNotebook } from "../../context";

type Props = { id: string; readOnly?: boolean; blockItems?: any[] };

export default function MenuBar({ id = "", readOnly = false, blockItems = [] }: Props) {
  const { menuItems, dispatcher } = useNotebook();
  const handleMenuItemSelection = (id: string, menuItem: any) => {
    dispatcher({ type: "menu-execution", id, name: menuItem.name, action: menuItem.action });
  };
  const handleDeleteBlock = (id: string) => dispatcher({ type: "block-delete", id });
  const handleMoveBlockUp = (id: string) => dispatcher({ type: "block-move", id, dir: "up" });
  const handleMoveBlockDown = (id: string) => dispatcher({ type: "block-move", id, dir: "down" });
  const renderMenuItem = (menuItem: any) => (
    <DropdownMenuItem key={`${id}-${menuItem.name}`} className="flex items-center justify-between py-2" onSelect={() => handleMenuItemSelection(id, menuItem)}>
      <div className="flex items-center space-inbetween">
        <span className="flex-grow font-medium">{menuItem.name}</span>
      </div>
      <DropdownMenuShortcut>{menuItem.shortcut}</DropdownMenuShortcut>
    </DropdownMenuItem>
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button disabled={readOnly} className={`flex items-center justify-center w-9 h-9 text-muted-foreground rounded cursor-pointer opacity-0 hover:text-accent-foreground hover:bg-accent group-hover:opacity-100 ${readOnly === true ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex flex-row justify-center space-x-4 text-xs">
          <Button className="mr-1 cursor-pointer" variant="ghost" onClick={() => handleMoveBlockUp(id)}>
            <ChevronUp />
          </Button>
          <Button className="mr-1 text-red-600 hover:text-red-1000 cursor-pointer" variant="ghost" onClick={() => handleDeleteBlock(id)}>
            <Trash />
          </Button>
          <Button className="cursor-pointer" variant="ghost" onClick={() => handleMoveBlockDown(id)}>
            <ChevronDown />
          </Button>
        </div>
        {blockItems.length > 0 || menuItems.length > 0 ? <DropdownMenuSeparator /> : <></>}
        {blockItems.map((blockItem) => renderMenuItem(blockItem))}
        {blockItems.length > 0 ? <DropdownMenuSeparator /> : <></>}
        {menuItems.map((menuItem) => renderMenuItem(menuItem))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
