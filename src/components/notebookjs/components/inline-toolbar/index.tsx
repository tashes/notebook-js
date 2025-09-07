import React from "react";
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

export default function InlineToolbar({ editorState, tools = [], references = { open: () => {}, search: () => {} }, onChange }: Props) {
  const isSelectionCollapsed = editorState.getSelection().isCollapsed();
  const selectionBounds = getSelectionBounds();
  if (!selectionBounds) return null;
  const toolbarWidth = 120; const toolbarHeight = 40; const margin = 8; const viewportWidth = window.innerWidth;
  let top = selectionBounds.top - toolbarHeight - margin;
  let left = selectionBounds.left + selectionBounds.width / 2 - toolbarWidth / 2;
  if (left < 10) left = 10;
  if (left + toolbarWidth > viewportWidth - 10) left = viewportWidth - toolbarWidth - 10;
  if (top < 10) top = selectionBounds.bottom + margin;
  const toolbarStyle = { position: "fixed" as const, top: `${top}px`, left: `${left}px`, zIndex: 9999 };

  const toggleFn = async ({ tool, styles }: { tool: any; styles: string[] }) => {
    let newState = editorState;
    styles.forEach((style) => { newState = RichUtils.toggleInlineStyle(newState, style); });
    if (!tool.component) { onChange(newState); return; }
    const selection = newState.getSelection();
    if (selection.isCollapsed()) { onChange(newState); return; }
    const content = newState.getCurrentContent();
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();
    const block = content.getBlockForKey(startKey);
    const entityKey = block.getEntityAt(startOffset);
    const latestStyle = styles.at(-1);
    const selectedText = block.getText().slice(startOffset, endOffset);
    const isSameEntity = entityKey && content.getEntity(entityKey).getType() === latestStyle;
    const mutability = getToolMutability(tool);
    const data = typeof tool.data === "function" ? tool.data(selectedText, references) : {};
    if (isSameEntity) {
      const contentWithoutEntity = Modifier.applyEntity(content, selection, null);
      const pushed = EditorState.push(newState, contentWithoutEntity, "apply-entity");
      onChange(pushed);
    } else {
      const contentWithEntity = content.createEntity(latestStyle!, mutability, data);
      const newEntityKey = contentWithEntity.getLastCreatedEntityKey();
      const contentWithAppliedEntity = Modifier.applyEntity(contentWithEntity, selection, newEntityKey);
      const pushed = EditorState.push(newState, contentWithAppliedEntity, "apply-entity");
      onChange(pushed);
    }
  };

  const renderTool = (tool: any) => {
    const currentStyles = editorState.getCurrentInlineStyle();
    const currentSelection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const isActive = (tool.styles || []).map((s: any) => s.name).some((style: string) => currentStyles.has(style));
    const toolItem = (
      <ToolItem key={tool.label} tool={tool} currentStyles={currentStyles as any} toggleFn={toggleFn} />
    );
    if (isSelectionCollapsed) return isActive ? toolItem : null;
    return toolItem;
  };

  return (
    <div className="inline-toolbar bg-popover text-popover-foreground shadow-md p-1 flex items-center space-x-1 border border-border" style={toolbarStyle} onMouseDown={(e) => e.preventDefault()}>
      {tools.map((tool) => renderTool(tool))}
    </div>
  );
}

