import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getSelectionBounds } from "../../utils/draft-helpers";
import { EditorState, Modifier, RichUtils } from "draft-js";
import ToolItem from "../tool-item";

function getToolMutability(tool: any): "IMMUTABLE" | "SEGMENTED" | "MUTABLE" {
    if (tool.constants?.includes("IMMUTABLE")) return "IMMUTABLE";
    if (tool.constants?.includes("SEGMENTED")) return "SEGMENTED";
    return "MUTABLE";
}

type Props = {
    editorState: EditorState;
    tools: any[];
    references?: { open: (r: any) => void; search: (q: string) => void };
    onChange: (s: EditorState) => void;
};

export default function InlineToolbar({
    editorState,
    tools = [],
    references = { open: () => {}, search: () => {} },
    onChange,
}: Props) {
    const [, setTick] = useState(0);
    useEffect(() => {
        let raf = 0;
        const bump = () => setTick((t) => (t + 1) % 1000000);
        const onScrollOrResize = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(bump);
        };
        window.addEventListener("resize", onScrollOrResize, { passive: true });
        // Capture scroll on any ancestor scrollable container
        window.addEventListener("scroll", onScrollOrResize, {
            passive: true,
            capture: true,
        } as any);
        document.addEventListener("selectionchange", onScrollOrResize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onScrollOrResize as any);
            window.removeEventListener(
                "scroll",
                onScrollOrResize as any,
                true as any,
            );
            document.removeEventListener(
                "selectionchange",
                onScrollOrResize as any,
            );
        };
    }, []);
    const isSelectionCollapsed = editorState.getSelection().isCollapsed();
    const selectionBounds = getSelectionBounds();
    if (!selectionBounds) return null;
    const margin = 8;
    // Anchor at the center of selection; use CSS transform to center horizontally
    const centerX = selectionBounds.left + selectionBounds.width / 2;
    let top = selectionBounds.top - margin; // place above by default
    // If too close to top, place below selection
    const placeBelow = top < 40; // heuristic
    if (placeBelow) top = selectionBounds.bottom + margin;
    const toolbarStyle = {
        position: "fixed" as const,
        top: `${top}px`,
        left: `${centerX}px`,
        transform: placeBelow ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        zIndex: 9999,
        willChange: "transform, top, left",
    };

    const toggleFn = async ({
        tool,
        styles,
    }: {
        tool: any;
        styles: string[];
    }) => {
        let newState = editorState;
        styles.forEach((style) => {
            newState = RichUtils.toggleInlineStyle(newState, style);
        });
        if (!tool.component) {
            onChange(newState);
            return;
        }
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
            const contentWithEntity = content.createEntity(
                latestStyle!,
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

    const renderTool = (tool: any) => {
        const currentStyles = editorState.getCurrentInlineStyle();
        const currentSelection = editorState.getSelection();
        const currentContent = editorState.getCurrentContent();
        const isActive = (tool.styles || [])
            .map((s: any) => s.name)
            .some((style: string) => currentStyles.has(style));
        const toolItem = (
            <ToolItem
                key={tool.label}
                tool={tool}
                currentStyles={currentStyles as any}
                toggleFn={toggleFn}
            />
        );
        if (isSelectionCollapsed) return isActive ? toolItem : null;
        return toolItem;
    };

    const content = (
        <div
            className="inline-toolbar bg-popover text-popover-foreground shadow-md p-1 flex items-center space-x-1 border border-border"
            style={toolbarStyle}
            onMouseDown={(e) => e.preventDefault()}
        >
            {tools.map((tool) => renderTool(tool))}
        </div>
    );
    return createPortal(content, document.body);
}
