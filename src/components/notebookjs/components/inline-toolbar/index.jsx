import React from "react";
import { getSelectionBounds } from "../../utils/draft-helpers";
import { EditorState, Modifier, RichUtils } from "draft-js";

import ToolItem from "../tool-item";

function getToolMutability(tool) {
    if (tool.constants?.includes("IMMUTABLE")) return "IMMUTABLE";
    if (tool.constants?.includes("SEGMENTED")) return "SEGMENTED";
    return "MUTABLE";
}

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

    const toggleFn = async ({ tool, styles }) => {
        let newState = editorState;

        // 1. Always apply inline styles
        styles.forEach((style) => {
            newState = RichUtils.toggleInlineStyle(newState, style);
        });

        // 2. If no component, skip entity logic
        if (!tool.component) {
            onChange(newState);
            return;
        }

        // 3. Check if the relevant entity already exists at selection
        const selection = newState.getSelection();
        if (selection.isCollapsed()) {
            onChange(newState);
            return;
        }

        const content = newState.getCurrentContent();
        const startKey = selection.getStartKey();
        const startOffset = selection.getStartOffset();
        const endOffset = selection.getEndOffset();
        const block = content.getBlockForKey(startKey);
        const entityKey = block.getEntityAt(startOffset);

        const latestStyle = styles.at(-1);
        const selectedText = block.getText().slice(startOffset, endOffset);

        const isSameEntity =
            entityKey && content.getEntity(entityKey).getType() === latestStyle;

        const mutability = getToolMutability(tool);
        const data =
            typeof tool.data === "function"
                ? tool.data(selectedText, references)
                : {};

        if (isSameEntity) {
            // 4. Remove the entity
            const contentWithoutEntity = Modifier.applyEntity(
                content,
                selection,
                null,
            );
            const pushed = EditorState.push(
                newState,
                contentWithoutEntity,
                "apply-entity",
            );
            onChange(pushed);
        } else {
            // 5. Create and apply a new entity
            const contentWithEntity = content.createEntity(
                latestStyle,
                mutability,
                data,
            );
            const newEntityKey = contentWithEntity.getLastCreatedEntityKey();
            const contentWithAppliedEntity = Modifier.applyEntity(
                contentWithEntity,
                selection,
                newEntityKey,
            );
            const pushed = EditorState.push(
                newState,
                contentWithAppliedEntity,
                "apply-entity",
            );
            onChange(pushed);
        }
    };

    const renderTool = (tool) => {
        let currentStyles = editorState.getCurrentInlineStyle();
        let currentSelection = editorState.getSelection();
        let currentContent = editorState.getCurrentContent();
        let isActive = tool.styles
            .map((style) => style.name)
            .some((style) => currentStyles.has(style));
        let toolItem = (
            <ToolItem
                key={tool.label}
                tool={tool}
                currentStyles={currentStyles}
                currentSelection={currentSelection}
                currentContent={currentContent}
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
