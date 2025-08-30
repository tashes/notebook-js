"use client";

// Re-export the same surface as main.jsx, but without importing CSS

// Notebook
export { default as NotebookJS } from "../src/components/notebookjs";

// Blocks
export { default as ParagraphBlock } from "../src/components/notebookjs/blocks/paragraph";
export { default as HeadingBlock } from "../src/components/notebookjs/blocks/heading";
export { default as SubheadingBlock } from "../src/components/notebookjs/blocks/subheading";
export { default as OrderedListBlock } from "../src/components/notebookjs/blocks/ordered-list";
export { default as UnorderedListBlock } from "../src/components/notebookjs/blocks/unordered-list";
export { default as ImageBlock } from "../src/components/notebookjs/blocks/image";
export { default as CanvasBlock } from "../src/components/notebookjs/blocks/canvas";
export { default as TableBlock } from "../src/components/notebookjs/blocks/table";
export { default as LatexBlock } from "../src/components/notebookjs/blocks/latex";

// Tools
export { default as BoldTool } from "../src/components/notebookjs/tools/bold";
export { default as ItalicTool } from "../src/components/notebookjs/tools/italic";
export { default as UnderlineTool } from "../src/components/notebookjs/tools/underline";
export { default as SuperscriptTool } from "../src/components/notebookjs/tools/superscript";
export { default as SubscriptTool } from "../src/components/notebookjs/tools/subscript";
export { default as HighlightTool } from "../src/components/notebookjs/tools/highlight";
export { default as LinkTool } from "../src/components/notebookjs/tools/link";

// Menu Items
export { default as EditPropsMenuItem } from "../src/components/notebookjs/menu/edit-props";

// Editors
export { default as EditPropsEditor } from "../src/components/notebookjs/editors/properties";
export { default as SetNumberingEditor } from "../src/components/notebookjs/editors/set-numbering";
export { default as ImageEditor } from "../src/components/notebookjs/editors/image";
export { default as CanvasEditor } from "../src/components/notebookjs/editors/canvas";
export { default as TableEditor } from "../src/components/notebookjs/editors/table";
export { default as LatexEditor } from "../src/components/notebookjs/editors/latex";

