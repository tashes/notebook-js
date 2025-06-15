import NotebookJS from "./components/notebookjs";

import ParagraphBlock from "./components/notebookjs/blocks/paragraph";
import HeadingBlock from "./components/notebookjs/blocks/heading";
import SubheadingBlock from "./components/notebookjs/blocks/subheading";
import UnorderedListBlock from "./components/notebookjs/blocks/unordered-list";
import OrderedListBlock from "./components/notebookjs/blocks/ordered-list";
import ImageBlock from "./components/notebookjs/blocks/image";
import CanvasBlock from "./components/notebookjs/blocks/canvas";
import TableBlock from "./components/notebookjs/blocks/table";

import BoldTool from "./components/notebookjs/tools/bold";
import HighlightTool from "./components/notebookjs/tools/highlight";

import EditProps from "./components/notebookjs/menu/edit-props";

import PropertiesEditor from "./components/notebookjs/editors/properties";
import SetNumberingEditor from "./components/notebookjs/editors/set-numbering";
import ImageEditor from "./components/notebookjs/editors/image";
import CanvasEditor from "./components/notebookjs/editors/canvas";
import TableEditor from "./components/notebookjs/editors/table";

import { useState } from "react";
import { useCallback } from "react";

function App() {
    let [blocks, setBlocks] = useState([]);
    let handleChange = useCallback((newBlocks) => setBlocks(newBlocks), []);

    let blockDefs = [
        ParagraphBlock,
        HeadingBlock,
        SubheadingBlock,
        UnorderedListBlock,
        OrderedListBlock,
        ImageBlock,
        CanvasBlock,
        TableBlock,
    ];
    let tools = [BoldTool, HighlightTool];
    let menus = [EditProps];
    let editors = [
        PropertiesEditor,
        SetNumberingEditor,
        ImageEditor,
        CanvasEditor,
        TableEditor,
    ];
    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">NotebookJS</h1>

            <div className="mb-6 rounded-md border border-gray-300">
                <NotebookJS
                    onChange={handleChange}
                    readOnly={false}
                    blocks={blockDefs}
                    tools={tools}
                    menuItems={menus}
                    editors={editors}
                />
            </div>

            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[400px]">
                {JSON.stringify(blocks, undefined, 4)}
            </pre>
        </div>
    );
}

export default App;
