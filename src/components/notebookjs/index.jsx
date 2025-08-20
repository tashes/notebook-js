// NOTE: This file was adapted from the original NotebookJS implementation in
// https://github.com/tashes/notebook-js.  The goal of this version is to
// expose NotebookJS as a _controlled component_.  Instead of accepting an
// `initialBlocks` prop and maintaining its own internal list of blocks,
// NotebookJS now accepts a `blocks` prop which represents the current value
// and an `onChange` callback which should be wired to your state setter.  If
// the passed `blocks` array is empty, a friendly call‑to‑action button is
// displayed allowing the user to create the first block.  Block definitions
// previously passed via the `blocks` prop have been renamed to
// `blockTypes` to avoid naming collisions.

import React, { useLayoutEffect, useMemo, useState, useEffect, useRef } from "react";

// Hooks and helpers
import { deepEquals } from "./utils/draft-helpers";
import { Block } from "./data/block";
import { reducer } from "./utils/reducer";
// Note: generateId and generateBlockId imports have been removed because
// NotebookJS no longer creates a default block internally.  New blocks are
// created via the reducer using the provided block definitions.

// Components
import ParagraphBlock from "./blocks/paragraph";
import BoldTool from "./tools/bold";
import EditProps from "./menu/edit-props";
import PropertiesEditor from "./editors/properties";
// BlockType and MenuBar are unused in this controlled version.  They have
// been removed to reduce bundle size and avoid unused import warnings.
import Editor from "./components/editor";
import NotebookBlock from "./components/notebook-block";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";

// Default definitions.  These correspond to the previous defaults but have
// been renamed to clarify their purpose.
const defaultBlockTypes = [ParagraphBlock];
const defaultTools = [BoldTool];
const defaultMenuItems = [EditProps];
const defaultEditors = [PropertiesEditor];

/**
 * NotebookJS – a controlled block editor.
 *
 * @param {Object} props Component properties
 * @param {boolean} [props.readOnly=false] If true, disables editing
 * @param {Array<Object>} [props.blocks=[]] The current list of blocks (controlled value)
 * @param {Function} [props.onChange=()=>{}] Called with the new block list when it changes
 * @param {Array<Function>} [props.blockTypes=defaultBlockTypes] Available block definitions
 * @param {Array<Object>} [props.tools=defaultTools] Available inline style tools
 * @param {Array<Function>} [props.editors=defaultEditors] Available editors
 * @param {Array<Object>} [props.menuItems=defaultMenuItems] Available menu items
 * @param {Function} [props.initProps=()=>({})] Function returning a default props object for new blocks
 * @param {Function} [props.openReference] Callback to open a reference
 * @param {Function} [props.searchReferences] Callback to search references
 */
export default function NotebookJS({
    readOnly = false,
    blocks = [],
    onChange = () => {},
    blockTypes = defaultBlockTypes,
    tools = defaultTools,
    editors = defaultEditors,
    menuItems = defaultMenuItems,
    initProps = () => ({}),
    openReference = () => {},
    searchReferences = () => {},
}) {
    // Show a single editor overlay when editing properties or other block‑level data
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorData, setEditorData] = useState({
        name: "",
        data: {},
        currentBlockId: undefined,
    });
    const editorFns = useMemo(() => ({
        openEditor: (editor, data, block) => {
            setEditorData({ name: editor, data, currentBlockId: block?.id });
            setIsEditorOpen(true);
        },
        closeEditor: () => {
            setIsEditorOpen(false);
            setEditorData({ name: "", data: {}, currentBlockId: undefined });
        },
    }), []);

    // Local state representing the current list of Block instances.  This is
    // derived from the controlled `blocks` prop and updated whenever `blocks`
    // changes.  All reducer operations write to this state and then call
    // `onChange` with the serialised form of the new state.
    const [notebookBlocks, setNotebookBlocks] = useState(() => {
        return Array.isArray(blocks) && blocks.length > 0
            ? blocks.map((b) => new Block(b))
            : [];
    });

    // When the `blocks` prop changes from the parent, synchronise our local
    // Block instances.  We rely on deep equality to avoid unnecessary resets.
    useEffect(() => {
        // Convert incoming plain objects to Block instances
        const incoming = Array.isArray(blocks) ? blocks.map((b) => new Block(b)) : [];
        if (!deepEquals(incoming.map((b) => b.toObj()), notebookBlocks.map((b) => b.toObj()))) {
            setNotebookBlocks(incoming);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocks]);

    // Map of block id to ref for focusing.  Passed down to child components.
    const refsMap = useRef(new Map());
    // List of callbacks to run after the reducer updates state.  Reducer
    // operations can register callbacks here to manipulate focus or modify
    // blocks once the update has taken effect.
    const [callbacks, setCallbacks] = useState([]);
    const addCallback = (cb) => setCallbacks((prev) => [...prev, cb]);

    // Dispatch function that forwards actions into the async reducer.  The
    // reducer may return synchronously or asynchronously; either way, the
    // resulting state is normalised to an array of `Block` instances and
    // written into local state.  After updating the state we invoke
    // `onChange` if the serialised form differs from the controlled value.
    const dispatchNotebookBlocks = (action) => {
        try {
            const result = reducer({
                state: notebookBlocks,
                action,
                refsMap: refsMap.current,
                blocks: blockTypes,
                tools,
                editors,
                menuItems,
                openReference,
                searchReferences,
                initProps,
                addCallback,
                editorFns,
                dispatcher: dispatchNotebookBlocks,
            });
            const handleNewState = (newState) => {
                // Normalise plain objects to Block instances if necessary
                const blockInstances = newState.map((b) => (b instanceof Block ? b : new Block(b)));
                setNotebookBlocks(blockInstances);
            };
            if (result instanceof Promise) {
                result
                    .then(handleNewState)
                    .catch((err) => {
                        console.error("Async reducer error:", err);
                    });
            } else {
                handleNewState(result);
            }
        } catch (err) {
            console.error("Reducer error:", err);
        }
    };

    // After blocks change: remove refs for deleted blocks and run pending callbacks
    useLayoutEffect(() => {
        // Remove refs for blocks that no longer exist
        const aliveIds = new Set(notebookBlocks.map((b) => b.id));
        for (const key of refsMap.current.keys()) {
            if (!aliveIds.has(key)) {
                refsMap.current.delete(key);
            }
        }
        // Execute callbacks registered by reducer actions. These callbacks may
        // perform focus changes or other side effects after the state update.
        callbacks.forEach((cb) =>
            cb({
                state: notebookBlocks,
                refsMap: refsMap.current,
                blocks: blockTypes,
                tools,
                menuItems,
                openReference,
                searchReferences,
                initProps,
            }),
        );
        // Only reset the callback queue when there were callbacks to run.
        // Invoking setCallbacks with a new empty array each render when the
        // array is already empty would cause an infinite render loop.
        if (callbacks.length > 0) {
            setCallbacks([]);
        }
    }, [notebookBlocks, callbacks, blockTypes, tools, menuItems, openReference, searchReferences, initProps]);

    // Propagate changes to parent.  Only fire `onChange` when the serialised
    // representation differs from the controlled `blocks` prop to avoid
    // feedback loops.
    useEffect(() => {
        const serialised = notebookBlocks.map((b) => b.toObj());
        if (!deepEquals(serialised, blocks)) {
            onChange(serialised);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notebookBlocks]);

    // Compute keyboard shortcuts for block type conversions and menu actions
    const shortcuts = useMemo(() => {
        const blockTypeShortcuts = blockTypes
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
        const menuItemShortcuts = menuItems
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

    // Render helper: create the first block when clicking the CTA button
    const createFirstBlock = () => {
        if (!blockTypes || blockTypes.length === 0) return;
        // Use the type of the first block type
        const blockType = blockTypes[0];
        dispatchNotebookBlocks({
            type: "create-new-block",
            id: undefined,
            position: "after",
            blockType: blockType.type,
        });
    };

    return (
        <>
            <div className="notebook-js rounded-md">
                {notebookBlocks.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-8">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                            onClick={createFirstBlock}
                        >
                            {blockTypes && blockTypes.length > 0
                                ? `Create ${blockTypes[0].label || blockTypes[0].name || "block"} block`
                                : "Create block"}
                        </button>
                    </div>
                ) : (
                    <div className="blocks-container w-full">
                        {notebookBlocks.map((block) => (
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
                        ))}
                    </div>
                )}
            </div>
            {isEditorOpen &&
                createPortal(
                    <Editor
                        editors={editors}
                        current={editorData.name}
                        data={editorData.data}
                        currentBlock={notebookBlocks.find((b) => b.id === editorData.currentBlockId)?.toObj()}
                        close={editorFns.closeEditor}
                        modifyBlock={(block) => {
                            dispatchNotebookBlocks({ type: "modify-raw-block", block });
                        }}
                    />,
                    document.body,
                )}
        </>
    );
}