import NotebookJS from "./components/notebookjs";

import ParagraphBlock from "./components/notebookjs/blocks/paragraph";
import HeadingBlock from "./components/notebookjs/blocks/heading";
import SubheadingBlock from "./components/notebookjs/blocks/subheading";
import UnorderedListBlock from "./components/notebookjs/blocks/unordered-list";
import OrderedListBlock from "./components/notebookjs/blocks/ordered-list";
import ImageBlock from "./components/notebookjs/blocks/image";
import CanvasBlock from "./components/notebookjs/blocks/canvas";
import TableBlock from "./components/notebookjs/blocks/table";
import LatexBlock from "./components/notebookjs/blocks/latex";

import BoldTool from "./components/notebookjs/tools/bold";
import ItalicTool from "./components/notebookjs/tools/italic";
import UnderlineTool from "./components/notebookjs/tools/underline";
import HighlightTool from "./components/notebookjs/tools/highlight";
import SuperscriptTool from "./components/notebookjs/tools/superscript";
import SubscriptTool from "./components/notebookjs/tools/subscript";
import LinkTool from "./components/notebookjs/tools/link";

import EditProps from "./components/notebookjs/menu/edit-props";

import PropertiesEditor from "./components/notebookjs/editors/properties";
import SetNumberingEditor from "./components/notebookjs/editors/set-numbering";
import ImageEditor from "./components/notebookjs/editors/image";
import CanvasEditor from "./components/notebookjs/editors/canvas";
import TableEditor from "./components/notebookjs/editors/table";
import LatexEditor from "./components/notebookjs/editors/latex";

import { useState, useEffect } from "react";

function App() {
    let [blocks, setBlocks] = useState([]);
    // Simulate loading initial blocks after a delay (e.g., from an API)
    // useEffect(() => {
    //     const initialBlocks = [
    //         {
    //             id: "0b7ebced8604a54cf330204f",
    //             blockid: "6cc008bd13",
    //             type: "paragraph",
    //             data: { text: "", inlineStyles: [] },
    //             props: {},
    //         },
    //         {
    //             id: "98659174df2cff632428f660",
    //             blockid: "0a20_dC7A8",
    //             type: "paragraph",
    //             data: { text: "", inlineStyles: [] },
    //             props: {},
    //         },
    //         {
    //             id: "686becb5df901bc1dd3179fb",
    //             blockid: "BA9fa1AE3d",
    //             type: "paragraph",
    //             data: { text: "Can this work?", inlineStyles: [] },
    //             props: {},
    //         },
    //         {
    //             id: "a0e835591a528777d9f3c5a1",
    //             blockid: "2EE75_Cf9C",
    //             type: "paragraph",
    //             data: { text: "", inlineStyles: [] },
    //             props: {},
    //         },
    //         {
    //             id: "e4e8a7e14013dbda4c2361d0",
    //             blockid: "546c377cCE",
    //             type: "canvas",
    //             data: {
    //                 text: "",
    //                 inlineStyles: [],
    //                 elements: [
    //                     {
    //                         id: "Yiyt4ufar0UsxnEEVlgAX",
    //                         type: "freedraw",
    //                         x: 283.892822265625,
    //                         y: 286.19366455078125,
    //                         width: 219.75,
    //                         height: 456.22265625,
    //                         angle: 0,
    //                         strokeColor: "#1e1e1e",
    //                         backgroundColor: "transparent",
    //                         fillStyle: "solid",
    //                         strokeWidth: 2,
    //                         strokeStyle: "solid",
    //                         roughness: 1,
    //                         opacity: 100,
    //                         groupIds: [],
    //                         frameId: null,
    //                         index: "a0",
    //                         roundness: null,
    //                         seed: 1440832493,
    //                         version: 29,
    //                         versionNonce: 1001663523,
    //                         isDeleted: false,
    //                         boundElements: null,
    //                         updated: 1755706194031,
    //                         link: null,
    //                         locked: false,
    //                         points: [
    //                             [0, 0],
    //                             [0, 0.77734375],
    //                             [0.1796875, 0.77734375],
    //                             [26.05078125, 0.77734375],
    //                             [31.0078125, 0.77734375],
    //                             [110.7890625, 11.0078125],
    //                             [128.23828125, 19.984375],
    //                             [145.3125, 33.24609375],
    //                             [154.16796875, 48.05859375],
    //                             [153.85546875, 128],
    //                             [112.328125, 201.86328125],
    //                             [97.34765625, 216.734375],
    //                             [74.09375, 236.9296875],
    //                             [70.2890625, 239.76171875],
    //                             [71.328125, 239.96875],
    //                             [125.7890625, 254.19140625],
    //                             [188.71484375, 285.57421875],
    //                             [212.765625, 308.875],
    //                             [219.75, 322.84375],
    //                             [200.91796875, 364.484375],
    //                             [139.578125, 419.24609375],
    //                             [116.609375, 434.609375],
    //                             [96.6640625, 447.0703125],
    //                             [90.99609375, 451.0625],
    //                             [90.1484375, 452.6328125],
    //                             [90.640625, 454.8828125],
    //                             [91.75390625, 456.22265625],
    //                             [91.75390625, 456.22265625],
    //                         ],
    //                         pressures: [],
    //                         simulatePressure: true,
    //                         lastCommittedPoint: [91.75390625, 456.22265625],
    //                     },
    //                 ],
    //                 files: {},
    //             },
    //             props: {},
    //         },
    //         {
    //             id: "a973283ad5af88c601f74951",
    //             blockid: "_c0d07b1eA",
    //             type: "paragraph",
    //             data: { text: "", inlineStyles: [] },
    //             props: {},
    //         },
    //     ];
    //     const timer = setTimeout(() => setBlocks(initialBlocks), 5000);
    //     return () => clearTimeout(timer);
    // }, [setBlocks]);

    let blockDefs = [
        ParagraphBlock,
        HeadingBlock,
        SubheadingBlock,
        UnorderedListBlock,
        OrderedListBlock,
        ImageBlock,
        CanvasBlock,
        TableBlock,
        LatexBlock,
    ];
    let tools = [
        BoldTool,
        ItalicTool,
        UnderlineTool,
        HighlightTool,
        SuperscriptTool,
        SubscriptTool,
        LinkTool,
    ];
    let menus = [EditProps];
    let editors = [
        PropertiesEditor,
        SetNumberingEditor,
        ImageEditor,
        CanvasEditor,
        TableEditor,
        LatexEditor,
    ];
    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">NotebookJS</h1>

            <div className="mb-6 rounded-md border border-gray-300">
                <NotebookJS
                    blocks={blocks}
                    onChange={setBlocks}
                    readOnly={false}
                    blockTypes={blockDefs}
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
