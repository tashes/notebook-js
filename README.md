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

    // Import tools
    BoldTool,
    HighlightTool,

    // Import editors
    SetNumberingEditor,
    ImageEditor,
    CanvasEditor
} from "@tamatashwin/notebook-js"

export default function App () {
    let [blocks, setBlocks] = useState([]);
    let handleChange = useCallback((newBlocks) => setBlocks(newBlocks), []);

    return (
        <div className="mb-6 rounded-md border border-gray-300">
            <NotebookJS
                onChange={handleChange}
                readOnly={false}
                blocks={[
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
