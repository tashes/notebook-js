# NotebookJS

This is an open sourced block based text editor that's designed to help with writing notes and dynamic content creation.

**Varied Block Types** - It has multiple types of blocks that should help with writing any type of note. Additionally other block types can be added to the system.
**Editors** - It's reasonable to argue that not all data type can be edited through a singular UI system, hence, editors exist to manage the varied block types.
**Tools** - It features tools to allow for rich text editing. Which is also extensible.
**React Compatible** - Overall, this system is react compatible, which I found to be the main difficulty with some other solutions.

## Installation
```bash
npm install @tamatashwin/notebook-js
```

## Usage
```javascript
import react, { useState, useCallback } from "react";
import {
    NotebookJS,

    // Import blocks
    ParagraphBlock,
    HeadingBlock,
    SubheadingBlock,
    UnorderedListBlock,
    OrderedListBlock,
    ImageBlock,
    CanvasBlock,
    LatexBlock,

    // Import tools
    BoldTool,
    HighlightTool,

    // Import editors
    SetNumberingEditor,
    ImageEditor,
    CanvasEditor,
    LatexEditor,
} from "@tamatashwin/notebook-js"
import "@tamatashwin/notebook-js/styles.css";

export default function App () {
    let [blocks, setBlocks] = useState([]);
    let handleChange = useCallback((newBlocks) => setBlocks(newBlocks), []);

    return (
        <div className="mb-6 rounded-md border border-gray-300">
            <NotebookJS
                blocks={blocks}
                onChange={handleChange}
                readOnly={false}
                blockTypes={[
                    ParagraphBlock,
                    HeadingBlock,
                    SubheadingBlock,
                    UnorderedListBlock,
                    OrderedListBlock,
                    ImageBlock,
                    CanvasBlock
                ]}
                tools={[
                    BoldTool,
                    HighlightTool
                ]}
                editors={[
                    SetNumberingEditor,
                    ImageEditor,
                    CanvasEditor
                ]}
            />
        </div>
    );
};
```

## Next.js (App Router) Usage

- Import from the client-only subpath and add the CSS explicitly:

```tsx
"use client";
import React, { useState, useCallback } from "react";
import {
  NotebookJS,
  ParagraphBlock,
  HeadingBlock,
  SubheadingBlock,
  UnorderedListBlock,
  OrderedListBlock,
  ImageBlock,
  CanvasBlock,
  LatexBlock,
  BoldTool,
  HighlightTool,
  SetNumberingEditor,
  ImageEditor,
  CanvasEditor,
  LatexEditor,
} from "@tamatashwin/notebook-js/client"; // note the /client subpath
import "@tamatashwin/notebook-js/styles.css"; // import styles in a client boundary

export default function Notebook() {
  const [blocks, setBlocks] = useState([]);
  const handleChange = useCallback((next) => setBlocks(next), []);

  return (
    <NotebookJS
      blocks={blocks}
      onChange={handleChange}
      blockTypes=[
        ParagraphBlock,
        HeadingBlock,
        SubheadingBlock,
        UnorderedListBlock,
        OrderedListBlock,
        ImageBlock,
        CanvasBlock,
        LatexBlock
      ]
      tools={[BoldTool, HighlightTool]}
      editors={[SetNumberingEditor, ImageEditor, CanvasEditor, LatexEditor]}
    />
  );
}
```

- Since the client entry re-exports unbuilt source, add transpilation in `next.config.js`:

```js
// next.config.js
module.exports = {
  experimental: {
    // if you're using the app router
  },
  transpilePackages: ["@tamatashwin/notebook-js"],
};
```

If you accidentally import from `@tamatashwin/notebook-js` in a React Server Component, the package will throw with a helpful message. Always import from `@tamatashwin/notebook-js/client` inside a `'use client'` file.

## Dark Mode

- The library uses CSS variables and Tailwind tokens with a `.dark` class toggle.
- To enable dark mode, add `.dark` to a parent element (commonly `<html class="dark">`).
- Colors adapt via semantic classes like `bg-background`, `text-foreground`, `border-border`, `bg-accent`, etc.
- You control the theme toggle; the components automatically respond to the presence/absence of `.dark`.

## Shadcn Installation

Install the NotebookJS base setup (NotebookJS component + paragraph block + bold tool) directly from this repository's registry.

1. Register the NotebookJS namespace with shadcn (run once per project):

```bash
npx shadcn@latest registry add @notebook=https://raw.githubusercontent.com/tashes/notebook-js/main/components/{name}.json
```

2. Install the base component from that namespace:

```bash
npx shadcn@latest add @notebook/notebookjs -y
```

3. Import the component and styles in your app:

```tsx
import { useState } from "react";
import NotebookJS from "@/components/notebookjs";
import "@tamatashwin/notebook-js/styles.css";

export function Editor() {
  const [blocks, setBlocks] = useState([]);
  return <NotebookJS blocks={blocks} onChange={setBlocks} />;
}
```

4. The install creates files under `components/notebookjs/**`. By default it bundles the NotebookJS shell with the paragraph block type and the bold tool. Additional blocks/tools will ship as separate registry entries you can opt into later.

If you prefer a one-off install without adding a registry namespace, pass the direct URL instead:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/tashes/notebook-js/main/components/notebookjs.json -y
```

If you keep the default `components.json` aliases from `ui.shadcn.com`, everything will resolve automatically. Otherwise, update your aliases to point at the generated `components/notebookjs` directory. The install also reuses upstream shadcn primitives (`button`, `dropdown-menu`) via `registryDependencies`, so you can continue customizing those components in one place. The base install intentionally omits the legacy “Edit Props” menu item and Properties editor—add your own menu/editor if you need a props UI.

> **Maintaining the registry:** After changing any source files, run `npm run build:registry` to regenerate the schema-compliant files under `components/**` and the root `registry.json`. The generated `components/*.json` files are kept in git so GitHub raw URLs always serve the latest schema-compliant registry items—regenerate them before publishing.

All of the following commands assume you’ve already added the `@notebook` registry namespace.

### Adding the Paragraph Block

Install the paragraph block separately if you want to layer it onto an existing NotebookJS setup or override the base install:

```bash
npx shadcn@latest add @notebook/paragraph-block -y
```

Usage example:

```tsx
import ParagraphBlock from "@/components/notebookjs/blocks/paragraph";

<NotebookJS blockTypes={[ParagraphBlock]} ... />
```

This is the same block shipped with the base package, so no extra editors or tools are required beyond the defaults.

### Adding the Subheading Block

Add the subheading block if you want a midsize heading style alongside the default paragraph block:

```bash
npx shadcn@latest add @notebook/subheading-block -y
```

Usage example:

```tsx
import SubheadingBlock from "@/components/notebookjs/blocks/subheading";

<NotebookJS blockTypes={[ParagraphBlock, SubheadingBlock]} ... />
```

Like the paragraph entry, this relies entirely on the base NotebookJS install—no extra editors or menu items needed.

### Adding the Table Block

Bring in the full table experience (block + editor + toolbar icons):

```bash
npx shadcn@latest add @notebook/table-block -y
```

Usage example:

```tsx
import TableBlock from "@/components/notebookjs/blocks/table";
import TableEditor from "@/components/notebookjs/editors/table";

<NotebookJS
  blockTypes={[ParagraphBlock, TableBlock]}
  editors={[TableEditor]}
  ...
/>
```

The install includes the block preview, the modal editor UI, and the `Icon` helper used for table toolbar icons. No extra npm deps are required beyond the base NotebookJS package.

### Adding the Heading Block

Once the base NotebookJS install is in place, pull in the heading block:

```bash
npx shadcn@latest add @notebook/heading-block -y
```

After installation, include `HeadingBlock` in your editor configuration:

```tsx
import HeadingBlock from "@/components/notebookjs/blocks/heading";

<NotebookJS blockTypes={[ParagraphBlock, HeadingBlock]} ... />
```

The heading block reuses the same properties editor and menu items from the base install—no extra setup needed beyond adding it to your `blockTypes` array.

### Adding the Canvas Block

The canvas block ships with its own Excalidraw-powered editor. Install it after the base package:

```bash
npx shadcn@latest add @notebook/canvas-block -y
```

Then register it alongside your other blocks:

```tsx
import CanvasBlock from "@/components/notebookjs/blocks/canvas";

<NotebookJS blockTypes={[ParagraphBlock, CanvasBlock]} editors={[CanvasEditor]} ... />
```

The install places the `CanvasBlock` plus the `CanvasEditor` (and its CSS) into `components/notebookjs/**`, so the editor dialog opens automatically when menu actions invoke it.

### Adding the Image Block

The image block adds upload + image editing UI backed by its own editor dialog:

```bash
npx shadcn@latest add @notebook/image-block -y
```

Usage example:

```tsx
import ImageBlock from "@/components/notebookjs/blocks/image";
import ImageEditor from "@/components/notebookjs/editors/image";

<NotebookJS
  blockTypes={[ParagraphBlock, ImageBlock]}
  editors={[ImageEditor]}
  ...
/>
```

The block bundles the image picker UI, menu actions, and editor controls. Make sure you include `ImageEditor` in your `editors` array so menu items like “Change Image” open the dialog.

### Adding the LaTeX Block

Bring in the LaTeX block and editor when you need math rendering:

```bash
npx shadcn@latest add @notebook/latex-block -y
```

Then register both the block and the editor:

```tsx
import LatexBlock from "@/components/notebookjs/blocks/latex";
import LatexEditor from "@/components/notebookjs/editors/latex";
import "katex/dist/katex.min.css";

<NotebookJS
  blockTypes={[ParagraphBlock, LatexBlock]}
  editors={[LatexEditor]}
  ...
/>
```

The LaTeX entry installs the block, editor, accordion UI, and textarea helper, plus adds `katex` as a dependency. Make sure the KaTeX CSS is imported once in your app so both the block preview and editor render correctly.

### Adding the Ordered List Block

The ordered list block ships with menu shortcuts for indentation and a dedicated numbering editor:

```bash
npx shadcn@latest add @notebook/ordered-list-block -y
```

Usage example:

```tsx
import OrderedListBlock from "@/components/notebookjs/blocks/ordered-list";
import SetNumberingEditor from "@/components/notebookjs/editors/set-numbering";

<NotebookJS
  blockTypes={[ParagraphBlock, OrderedListBlock]}
  editors={[SetNumberingEditor]}
  ...
/>
```

After installation, the block’s menu automatically includes “Increase/Decrease Indentation” and “Set Numbering” actions. Including `SetNumberingEditor` in your `editors` array enables the modal that customizes numbering sequences.

### Adding the Unordered List Block

Install the unordered list block when you need bullet lists:

```bash
npx shadcn@latest add @notebook/unordered-list-block -y
```

Usage example:

```tsx
import UnorderedListBlock from "@/components/notebookjs/blocks/unordered-list";

<NotebookJS
  blockTypes={[ParagraphBlock, UnorderedListBlock]}
  ...
/>
```

It reuses the base text editor and built-in indentation shortcuts, so no additional editors are required beyond those already included with the NotebookJS base install.

### Adding Text Formatting Tools

All tool installs follow the same pattern—pull in the tool entry, import it, and append it to the `tools` array you pass into `NotebookJS`.

#### Bold Tool

```bash
npx shadcn@latest add @notebook/bold-tool -y
```

```tsx
import BoldTool from "@/components/notebookjs/tools/bold";

<NotebookJS blockTypes={[ParagraphBlock]} tools={[BoldTool]} ... />
```

#### Italic Tool

```bash
npx shadcn@latest add @notebook/italic-tool -y
```

```tsx
import ItalicTool from "@/components/notebookjs/tools/italic";

<NotebookJS blockTypes={[ParagraphBlock]} tools={[ItalicTool]} ... />
```

#### Underline Tool

```bash
npx shadcn@latest add @notebook/underline-tool -y
```

```tsx
import UnderlineTool from "@/components/notebookjs/tools/underline";

<NotebookJS blockTypes={[ParagraphBlock]} tools={[UnderlineTool]} ... />
```

#### Highlight Tool

```bash
npx shadcn@latest add @notebook/highlight-tool -y
```

```tsx
import HighlightTool from "@/components/notebookjs/tools/highlight";

<NotebookJS blockTypes={[ParagraphBlock]} tools={[HighlightTool]} ... />
```

This tool exposes multiple color swatches via the inline toolbar.

#### Link Tool

```bash
npx shadcn@latest add @notebook/link-tool -y
```

```tsx
import LinkTool from "@/components/notebookjs/tools/link";

<NotebookJS blockTypes={[ParagraphBlock]} tools={[LinkTool]} ... />
```

The link tool includes its own inline component that displays a tooltip and ctrl/⌘ click instructions.

#### Subscript Tool

```bash
npx shadcn@latest add @notebook/subscript-tool -y
```

```tsx
import SubscriptTool from "@/components/notebookjs/tools/subscript";

<NotebookJS blockTypes={[ParagraphBlock]} tools={[SubscriptTool]} ... />
```

#### Superscript Tool

```bash
npx shadcn@latest add @notebook/superscript-tool -y
```

```tsx
import SuperscriptTool from "@/components/notebookjs/tools/superscript";

<NotebookJS blockTypes={[ParagraphBlock]} tools={[SuperscriptTool]} ... />
```
