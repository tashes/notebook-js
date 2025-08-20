import React, { useLayoutEffect, useMemo, useState } from "react";

import { useAsyncReducer } from "./hooks/useasyncreducer";
import { Block } from "./data/block";
import { generateId, generateBlockId } from "./utils/ids";
import { reducer } from "./utils/reducer";
import { deepEquals } from "./utils/draft-helpers";

import BlockType from "./components/block-type";
import MenuBar from "./components/menu-bar";
import Editor from "./components/editor";
import NotebookBlock from "./components/notebook-block";

import ParagraphBlock from "./blocks/paragraph";

import BoldTool from "./tools/bold";

import EditProps from "./menu/edit-props";

import PropertiesEditor from "./editors/properties";
import { useRef } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

const defaultBlocks = [ParagraphBlock];
const defaultTools = [BoldTool];
const defaultMenuItems = [EditProps];
const defaultEditors = [PropertiesEditor];

export default function NotebookJS({
    readOnly = false,
    initialBlocks = [],
    onChange = () => {},
    blocks = defaultBlocks,
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
    const [callbacks, setCallbacks] = useState([]);
    let addCallback = (cb) => setCallbacks([...callbacks, cb]);

    // Notebook blocks
    const [notebookBlocks, dispatchNotebookBlocks] = useAsyncReducer(
        async (state, action) => {
            let result = await reducer({
                state,
                action,
                refsMap: refsMap.current,
                blocks,
                tools,
                editors,
                menuItems,
                openReference,
                searchReferences,
                initProps,
                addCallback,
                editorFns,
            });
            return result;
        },
        undefined,
        () => {
            if (initialBlocks && initialBlocks.length > 0)
                return initialBlocks.map((block) => new Block(block));
            else
                return [
                    new Block({
                        id: generateId(),
                        blockid: generateBlockId(),
                        type: blocks[0].type,
                        data: blocks[0].init(),
                        props: initProps(),
                    }),
                ];
        },
    );

    // After blocks change: clean up stale refs and run pending callbacks
    useLayoutEffect(() => {
        // Remove refs for blocks that no longer exist
        const aliveIds = new Set(notebookBlocks.map((b) => b.id));
        for (const key of refsMap.current.keys()) {
            if (!aliveIds.has(key)) {
                refsMap.current.delete(key);
            }
        }
        // Execute and clear callbacks
        callbacks.forEach((cb) =>
            cb({
                state: notebookBlocks,
                refsMap: refsMap.current,
                blocks,
                tools,
                menuItems,
                openReference,
                searchReferences,
                initProps,
            }),
        );
        setCallbacks([]);
    }, [notebookBlocks]);

    // Update the onChange
    useEffect(() => {
        if (
            !deepEquals(
                notebookBlocks.map((b) => b.toObj()),
                initialBlocks,
            )
        )
            onChange(notebookBlocks.map((block) => block.toObj()));
    }, [notebookBlocks, onChange]);

    let shortcuts = useMemo(() => {
        let blockTypeShortcuts = blocks
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
    }, [blocks, menuItems]);

    return (
        <>
            <div className="notebook-js rounded-md">
                <div className="blocks-container w-full">
                    {notebookBlocks.map((block) => (
                        <NotebookBlock
                            key={block.id}
                            block={block}
                            readOnly={readOnly}
                            blocks={blocks}
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
                    ))}
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
