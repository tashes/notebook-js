import React from "react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { ChevronDown, ChevronUp, MoreHorizontal, Trash, X } from "lucide-react";

export default function MenuBar({
    id = "",
    readOnly = false,
    blockItems = [],
    menuItems = [],
    dispatcher = () => {},
}) {
    let handleMenuItemSelection = (id, menuItem) => {
        dispatcher({
            type: "menu-execution",
            id: id,
            name: menuItem.name,
            action: menuItem.action,
        });
    };
    let handleDeleteBlock = (id) => {
        dispatcher({
            type: "block-delete",
            id: id,
        });
    };
    let handleMoveBlockUp = (id) => {
        dispatcher({
            type: "block-move",
            id: id,
            dir: "up",
        });
    };
    let handleMoveBlockDown = (id) => {
        dispatcher({
            type: "block-move",
            id: id,
            dir: "down",
        });
    };

    const renderMenuItem = (menuItem) => {
        return (
            <DropdownMenuItem
                key={`${id}-${menuItem.name}`}
                className="flex items-center justify-between py-2"
                onSelect={() => handleMenuItemSelection(id, menuItem)}
            >
                <div className="flex items-center space-inbetween">
                    <span className="flex-grow font-medium">
                        {menuItem.name}
                    </span>
                </div>
                <DropdownMenuShortcut>{menuItem.shortcut}</DropdownMenuShortcut>
            </DropdownMenuItem>
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    disabled={readOnly}
                    className={`flex items-center justify-center w-9 h-9 text-gray-400 rounded cursor-pointer opacity-0 hover:text-gray-600 hover:bg-gray-100 group-hover:opacity-100 ${readOnly === true ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <div className="flex flex-row justify-center space-x-4 text-xs">
                    <Button
                        className="mr-1 cursor-pointer"
                        variant="ghost"
                        onClick={() => handleMoveBlockUp(id)}
                    >
                        <ChevronUp />
                    </Button>
                    <Button
                        className="mr-1 text-red-600 hover:text-red-1000 cursor-pointer"
                        variant="ghost"
                        onClick={() => handleDeleteBlock(id)}
                    >
                        <Trash />
                    </Button>
                    <Button
                        className="cursor-pointer"
                        variant="ghost"
                        onClick={() => handleMoveBlockDown(id)}
                    >
                        <ChevronDown />
                    </Button>
                </div>
                {blockItems.length > 0 || menuItems.length > 0 ? (
                    <DropdownMenuSeparator />
                ) : (
                    <></>
                )}
                {blockItems.map((blockItem) => renderMenuItem(blockItem))}
                {blockItems.length > 0 ? <DropdownMenuSeparator /> : <></>}
                {menuItems.map((menuItem) => renderMenuItem(menuItem))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
