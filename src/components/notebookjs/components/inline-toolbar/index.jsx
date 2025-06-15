import React from "react";
import { getSelectionBounds } from "../../utils/draft-helpers";
import { RichUtils } from "draft-js";

import ToolItem from "../tool-item";

export default function InlineToolbar({
    editorState = {},
    tools = [],
    references = {
        open: () => {},
        search: () => {},
    },
    onChange = {},
}) {
    const isSelectionCollapsed = editorState.getSelection().isCollapsed();
    const selectionBounds = getSelectionBounds();
    if (!selectionBounds) return null;

    // Calculate position
    const toolbarWidth = 120;
    const toolbarHeight = 40;
    const margin = 8;
    const viewportWidth = window.innerWidth;
    let top = selectionBounds.top - toolbarHeight - margin;
    let left =
        selectionBounds.left + selectionBounds.width / 2 - toolbarWidth / 2;
    if (left < 10) left = 10;
    if (left + toolbarWidth > viewportWidth - 10)
        left = viewportWidth - toolbarWidth - 10;
    if (top < 10) top = selectionBounds.bottom + margin;
    const toolbarStyle = {
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
    };

    const toggleFn = (...styles) => {
        let newState = editorState;
        styles.forEach((style) => {
            newState = RichUtils.toggleInlineStyle(newState, style);
        });
        onChange(newState);
    };

    const renderTool = (tool) => {
        let currentStyles = editorState.getCurrentInlineStyle();
        let isActive = tool.styles
            .map((style) => style.name)
            .some((style) => currentStyles.has(style));
        let toolItem = (
            <ToolItem
                key={tool.label}
                tool={tool}
                currentStyles={currentStyles}
                toggleFn={toggleFn}
            />
        );

        if (isSelectionCollapsed) {
            if (isActive) {
                return toolItem;
            } else {
                return null;
            }
        } else {
            return toolItem;
        }
    };

    return (
        <div
            className="inline-toolbar bg-white shadow-md p-1 flex items-center space-x-1 border border-gray-200"
            style={toolbarStyle}
            onMouseDown={(e) => e.preventDefault()}
        >
            {tools.map((tool, index, allTools) =>
                renderTool(tool, index, allTools),
            )}
        </div>
    );
}
