import React, { createRef } from "react";
import BlockType from "../block-type";
import MenuBar from "../menu-bar";
import { deepEquals } from "../../utils/draft-helpers";

function NotebookBlock(props) {
    const {
        block,
        readOnly,
        blocks,
        tools,
        menuItems,
        shortcuts,
        dispatcher,
        openReference,
        searchReferences,
        editors,
        editorFns,
        refsMap,
    } = props;

    if (!refsMap.current.has(block.id)) {
        refsMap.current.set(block.id, createRef());
    }
    const editorRef = refsMap.current.get(block.id);

    const openEditor = (name, data) => {
        if (!editors.find((e) => e.label === name)) {
            throw new Error(`Editor "${name}" not found`);
        }
        editorFns.openEditor(name, data, block);
    };

    const Def = blocks.find((b) => b.type === block.type);
    const blockMenuItems = Def.menuItems
        .filter((mi) => mi.shortcut)
        .map((mi) => ({
            shortcut: mi.shortcut,
            action: ({ id, dispatcher }) => {
                dispatcher({
                    type: "menu-execution",
                    id,
                    name: mi.name,
                    action: mi.action,
                });
            },
        }));
    const combinedShortcuts = [...shortcuts, ...blockMenuItems];

    return (
        <div
            className="block-wrapper relative w-full overflow-hidden"
            key={block.id}
        >
            <div className="block-editor w-full overflow-hidden p-1 rounded-md transition-colors group flex flex-row text-sm hover:bg-gray-50">
                <div className="w-9 p-0 mr-1">
                    <BlockType
                        id={block.id}
                        readOnly={readOnly}
                        type={block.type}
                        blocks={blocks}
                        dispatcher={dispatcher}
                    />
                </div>
                <div className="flex-1 mr-1 overflow-hidden">
                    <Def
                        id={block.id}
                        readOnly={readOnly}
                        blockid={block.blockid}
                        data={block.data}
                        props={block.props}
                        block={block.toObj()}
                        tools={tools}
                        references={{
                            search: searchReferences,
                            open: openReference,
                        }}
                        shortcuts={combinedShortcuts}
                        dispatcher={dispatcher}
                        ref={editorRef}
                        openEditor={openEditor}
                    />
                </div>
                <div className="w-9 p-0 m-0">
                    <MenuBar
                        id={block.id}
                        readOnly={readOnly}
                        blockItems={Def.menuItems}
                        menuItems={menuItems}
                        dispatcher={dispatcher}
                    />
                </div>
            </div>
        </div>
    );
}

// Only re-render a block when its own data or props (or readOnly) change
const areEqual = (prev, next) => {
    return (
        prev.readOnly === next.readOnly &&
        prev.block.id === next.block.id &&
        prev.block.blockid === next.block.blockid &&
        deepEquals(prev.block.data, next.block.data) &&
        deepEquals(prev.block.props, next.block.props)
    );
};

export default React.memo(NotebookBlock, areEqual);
