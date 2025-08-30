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
