import React, { useEffect, useMemo, useState, useRef } from "react";

import { Block } from "./data/block";
import { generateId, generateBlockId } from "./utils/ids";
import { reducer } from "./utils/reducer";

import BlockType from "./components/block-type";
import MenuBar from "./components/menu-bar";
import Editor from "./components/editor";
import NotebookBlock from "./components/notebook-block";

import ParagraphBlock from "./blocks/paragraph";

import BoldTool from "./tools/bold";

import EditProps from "./menu/edit-props";

import PropertiesEditor from "./editors/properties";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";

const defaultBlockTypes = [ParagraphBlock];
const defaultTools = [BoldTool];
const defaultMenuItems = [EditProps];
const defaultEditors = [PropertiesEditor];

export default function NotebookJS({
    readOnly = false,
    // Controlled block data: array of plain block objects
    blocks = [],
    // Change handler: receives new array of block objects
    onChange = () => {},
    // Block definitions
    blockTypes = defaultBlockTypes,
    tools = defaultTools,
    editors = defaultEditors,
    menuItems = defaultMenuItems,
    initProps = () => ({}),
    openReference = () => {},
    searchReferences = () => {},
}) {
    // Editors
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorData, setEditorData] = useState({
        name: "",
        data: {},
        currentBlockId: undefined,
    });
    let editorFns = useMemo(
        () => ({
            openEditor: (editor, data, block) => {
                setEditorData({
                    name: editor,
                    data,
                    currentBlockId: block?.id,
                });
                setIsEditorOpen(true);
            },
            closeEditor: () => {
                setIsEditorOpen(false);
                setEditorData({
                    name: "",
                    data: {},
                    currentBlockId: undefined,
                });
            },
        }),
        [],
    );
    let modifyBlock = (block) => {
        dispatchNotebookBlocks({
            type: "modify-raw-block",
            block: block,
        });
    };

    // Callbacks
    const refsMap = useRef(new Map());
    // Controlled mode: derive block instances from props.blocks
    const notebookBlocks = blocks.map((b) => new Block(b));

    // Dispatch actions: run reducer and propagate changes
    const dispatchNotebookBlocks = async (action) => {
        // Build current Block instances
        const currentBlocks = blocks.map((b) => new Block(b));
        // Run reducer
        const result = await reducer({
            state: currentBlocks,
            action,
            refsMap: refsMap.current,
            blocks: blockTypes,
            tools,
            editors,
            menuItems,
            openReference,
            searchReferences,
            initProps,
            // disable internal callbacks; using external focus logic
            addCallback: () => {},
            editorFns,
            dispatcher: dispatchNotebookBlocks,
        });
        // Notify parent of new state
        const newBlocks = result.map((block) => block.toObj());
        onChange(newBlocks);
        // Handle focus movement for new blocks
        if (action.type === "create-new-block") {
            const oldIds = new Set(currentBlocks.map((b) => b.id));
            const added = result.find((b) => !oldIds.has(b.id));
            if (added) {
                setTimeout(() => {
                    const ref = refsMap.current.get(added.id);
                    ref?.current?.focusAtStart();
                }, 0);
            }
        }
        // Handle focus shifting between blocks
        if (action.type === "focus-move") {
            // Determine current block order
            const ids = result.map((b) => b.id);
            const idx = ids.indexOf(action.id);
            if (idx !== -1) {
                let targetId;
                if (action.dir === "up" && idx > 0) {
                    targetId = ids[idx - 1];
                } else if (action.dir === "down" && idx < ids.length - 1) {
                    targetId = ids[idx + 1];
                }
                if (targetId) {
                    setTimeout(() => {
                        const ref = refsMap.current.get(targetId);
                        if (ref?.current) {
                            if (action.dir === "up") {
                                ref.current.focusAtEnd();
                            } else {
                                ref.current.focusAtStart();
                            }
                        }
                    }, 0);
                }
            }
        }
    };

    // Clean up stale refs when controlled blocks change
    useEffect(() => {
        const aliveIds = new Set(blocks.map((b) => b.id));
        for (const key of refsMap.current.keys()) {
            if (!aliveIds.has(key)) {
                refsMap.current.delete(key);
            }
        }
    }, [blocks]);

    let shortcuts = useMemo(() => {
        let blockTypeShortcuts = blockTypes
            .filter((blockType) => blockType.shortcut)
            .map((blockType) => ({
                shortcut: blockType.shortcut,
                action: ({ id, blockType: oldBlock, dispatcher }) => {
                    dispatcher({
                        type: "block-type-conversion",
                        id,
                        oldBlockType: oldBlock.type,
                        newBlockType: blockType.type,
                    });
                },
            }));
        let menuItemShortcuts = menuItems
            .filter((menuItem) => menuItem.shortcut)
            .map((menuItem) => ({
                shortcut: menuItem.shortcut,
                action: ({ id, dispatcher }) => {
                    dispatcher({
                        type: "menu-execution",
                        id,
                        name: menuItem.name,
                        action: menuItem.action,
                    });
                },
            }));

        return [...blockTypeShortcuts, ...menuItemShortcuts];
    }, [blockTypes, menuItems]);

    return (
        <>
            <div className="notebook-js rounded-md">
                <div className="blocks-container w-full">
                    {notebookBlocks.length === 0 ? (
                        <div className="flex justify-center items-center py-4">
                            <Button
                                variant="outline"
                                className="px-4 py-2 text-sm"
                                onClick={() => {
                                    const newBlock = new Block({
                                        id: generateId(),
                                        blockid: generateBlockId(),
                                        type: blockTypes[0].type,
                                        data: blockTypes[0].init(),
                                        props: initProps(),
                                    });
                                    onChange([newBlock.toObj()]);
                                }}
                            >
                                Create{" "}
                                {blockTypes[0].label ||
                                    blockTypes[0].name ||
                                    "block"}{" "}
                                block
                            </Button>
                        </div>
                    ) : (
                        notebookBlocks.map((block) => (
                            <NotebookBlock
                                key={block.id}
                                block={block}
                                readOnly={readOnly}
                                blocks={blockTypes}
                                tools={tools}
                                menuItems={menuItems}
                                shortcuts={shortcuts}
                                dispatcher={dispatchNotebookBlocks}
                                openReference={openReference}
                                searchReferences={searchReferences}
                                editors={editors}
                                editorFns={editorFns}
                                refsMap={refsMap}
                            />
                        ))
                    )}
                </div>
            </div>
            {isEditorOpen &&
                createPortal(
                    <Editor
                        editors={editors}
                        current={editorData.name}
                        data={editorData.data}
                        currentBlock={notebookBlocks
                            .find((b) => b.id === editorData.currentBlockId)
                            ?.toObj()}
                        close={editorFns.closeEditor}
                        modifyBlock={modifyBlock}
                    />,
                    document.body,
                )}
        </>
    );
}
