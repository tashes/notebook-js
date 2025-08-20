// This file contains a near‑verbatim copy of the reducer implementation from
// the original NotebookJS project (https://github.com/tashes/notebook-js).
// It has been adapted slightly to support a controlled component model.  In
// particular, the `deleteBlock` function no longer forces the editor to
// always contain at least one block; if the final block is deleted the
// resulting state will be an empty array.  Focus management for deletions has
// been updated accordingly.

import { Block } from "../data/block";
import { generateBlockId, generateId } from "./ids";

/**
 * Reducer entry point.  Dispatches actions to the appropriate handler and
 * returns either a new state array synchronously or a promise that resolves
 * with the new state.  See individual handler implementations for
 * documentation.
 */
export async function reducer(p) {
    let {
        state,
        action,
        refsMap,
        blocks,
        tools,
        editors,
        menuItems,
        openReference,
        searchReferences,
        initProps,
        addCallback,
        editorFns,
        dispatcher,
    } = p;
    switch (action.type) {
        case "block-type-conversion":
            return await convertBlockType({
                ...p,
            });
        case "menu-execution":
            return await executeMenu({
                ...p,
            });
        case "base-text-update":
            return await baseTextUpdate({
                ...p,
            });
        case "block-delete": {
            return await deleteBlock({
                ...p,
            });
        }
        case "block-move":
            return await moveBlock({
                ...p,
            });
        case "focus-move":
            return await moveFocus({
                ...p,
            });
        case "create-new-block": {
            return await createNewBlock({
                ...p,
            });
        }
        case "modify-raw-block": {
            return await modifyRawBlock({
                ...p,
            });
        }
        default:
            console.error(`Unknown action: ${action.type}`);
            break;
    }
    return state;
}

// Create a new block immediately before or after the specified block.  If no
// `id` is provided the new block is appended to the end of the state.
async function createNewBlock({
    state,
    action,
    blocks,
    initProps,
    addCallback,
}) {
    // Build the new block instance
    let currentBlock = state.find((b) => b.id === action.id);
    let blockDef = blocks.find((b) => b.type === action.blockType);
    let newBlock = new Block({
        id: generateId(),
        blockid: generateBlockId(),
        type: blockDef.type,
        data: blockDef.init(currentBlock),
        props: initProps(),
    });
    // Find the numeric index of the current block
    let currentIndex = state.findIndex((b) => b.id === action.id);
    if (currentIndex === -1) {
        // If not found, append to end
        return [...state, newBlock];
    }
    // Compute insertion index: before or after current
    let insertIndex = action.position === "before" ? currentIndex : currentIndex + 1;
    // Move focus to new Block
    addCallback(({ refsMap: newRefs }) => {
        const ref = newRefs.get(newBlock.id);
        if (ref && ref.current) {
            ref.current.focusAtStart();
        }
    });
    // New state
    let newState = [...state.slice(0, insertIndex), newBlock, ...state.slice(insertIndex)];
    // Lifecycle hooks
    for (let i = 0; i < blocks.length; i++) {
        let blockD = blocks[i];
        if (typeof blockD.onCreateNewBlock === "function") {
            let modifyBlock = (nBlock) => {
                let index = newState.findIndex((b) => b.id === nBlock.id);
                newState = [
                    ...newState.slice(0, index),
                    new Block(nBlock),
                    ...newState.slice(index + 1),
                ];
            };
            let focusOnCurrentBlock = () => {
                addCallback(({ refsMap }) => {
                    let ref = refsMap.get(newBlock.id);
                    ref.current.focusAtStart();
                });
            };
            await blockD.onCreateNewBlock(
                {
                    currentBlock: newBlock.toObj(),
                    state: newState.map((a) => a.toObj()),
                    action,
                },
                {
                    modifyBlock,
                    focusOnCurrentBlock,
                },
            );
        }
    }
    // Return new state array with newBlock inserted
    return newState;
}

// Delete a block by its id.  If the final block is removed the resulting
// state will be empty.  Focus is moved to either the next or previous
// remaining block when possible.
async function deleteBlock({ state, action, blocks, initProps, addCallback }) {
    let index = state.findIndex((block) => block.id === action.id);
    let currentBlock = state[index];
    // Return state if block id is not found
    if (index === -1) return state;
    // Remove the block from state
    let newState = state.filter((block) => block.id !== action.id);
    const newStateLength = newState.length;
    // Manage focus only when there is at least one remaining block
    if (newStateLength > 0) {
        addCallback(({ refsMap: newRefs }) => {
            // If the removed block was not the last in the original state then
            // focus the next block; otherwise focus the new last block.
            if (index < newStateLength) {
                const nextBlockId = newState[index].id;
                const ref = newRefs.get(nextBlockId);
                if (ref && ref.current) {
                    ref.current.focusAtStart();
                }
            } else {
                const prevBlockId = newState[newStateLength - 1].id;
                const ref = newRefs.get(prevBlockId);
                if (ref && ref.current) {
                    ref.current.focusAtEnd();
                }
            }
        });
    }
    // Lifecycle hooks
    for (let i = 0; i < blocks.length; i++) {
        let blockD = blocks[i];
        if (typeof blockD.onDeleteBlock === "function") {
            let modifyBlock = (nBlock) => {
                let idx = newState.findIndex((b) => b.id === nBlock.id);
                newState = [
                    ...newState.slice(0, idx),
                    new Block(nBlock),
                    ...newState.slice(idx + 1),
                ];
            };
            let focusOnCurrentBlock = () => {};
            await blockD.onDeleteBlock(
                {
                    currentBlock: currentBlock.toObj(),
                    state: newState.map((a) => a.toObj()),
                    action,
                },
                {
                    modifyBlock,
                    focusOnCurrentBlock,
                },
            );
        }
    }
    return newState;
}

// Update base text and inline styles within a block.  Returns the updated
// state and runs lifecycle hooks for interested block types.
async function baseTextUpdate({ state, blocks, action, addCallback }) {
    let block = state.find((b) => b.id === action.id);
    let blockIndex = state.findIndex((b) => b.id === action.id);
    let blockObj = block.toObj();
    let newBlock = new Block({
        ...blockObj,
        data: {
            ...blockObj.data,
            text: action.text,
            inlineStyles: action.inlineStyles,
        },
    });
    let newState = [...state.slice(0, blockIndex), newBlock, ...state.slice(blockIndex + 1)];
    // Lifecycle hooks
    for (let i = 0; i < blocks.length; i++) {
        let blockD = blocks[i];
        if (typeof blockD.onBaseTextUpdate === "function") {
            let modifyBlock = (nBlock) => {
                let idx = newState.findIndex((b) => b.id === nBlock.id);
                newState = [
                    ...newState.slice(0, idx),
                    new Block(nBlock),
                    ...newState.slice(idx + 1),
                ];
            };
            let focusOnCurrentBlock = () => {
                addCallback(({ refsMap }) => {
                    let ref = refsMap.get(newBlock.id);
                    ref.current.focusAtStart();
                });
            };
            await blockD.onBaseTextUpdate(
                {
                    currentBlock: newBlock.toObj(),
                    state: state.map((a) => a.toObj()),
                    action,
                },
                {
                    modifyBlock,
                    focusOnCurrentBlock,
                },
            );
        }
    }
    return newState;
}

// Move a block up or down within the state array.  Focus is restored to the
// original position after the move completes.
async function moveBlock({ state, action, blocks, addCallback, refsMap }) {
    let blockIndex = state.findIndex((b) => b.id === action.id);
    let ref = refsMap.get(action.id);
    let position = ref.current.getCurrentPosition();
    let newState = [...state];
    addCallback(({ refsMap: newRefs }) => {
        let ref = newRefs.get(action.id);
        ref.current.focusAt(position);
    });
    if (action.dir === "up" && blockIndex > 0) {
        newState = [
            ...newState.slice(0, blockIndex - 1),
            ...newState.slice(blockIndex, blockIndex + 1),
            ...newState.slice(blockIndex - 1, blockIndex),
            ...newState.slice(blockIndex + 1),
        ];
    }
    if (action.dir === "down") {
        newState = [
            ...newState.slice(0, blockIndex),
            ...newState.slice(blockIndex + 1, blockIndex + 2),
            ...newState.slice(blockIndex, blockIndex + 1),
            ...newState.slice(blockIndex + 2),
        ];
    }
    // Lifecycle hooks
    for (let i = 0; i < blocks.length; i++) {
        let blockD = blocks[i];
        if (typeof blockD.onMoveBlock === "function") {
            let modifyBlock = (nBlock) => {
                let idx = newState.findIndex((b) => b.id === nBlock.id);
                newState = [
                    ...newState.slice(0, idx),
                    new Block(nBlock),
                    ...newState.slice(idx + 1),
                ];
            };
            let focusOnCurrentBlock = () => {
                addCallback(({ refsMap }) => {
                    let ref = refsMap.get(state[blockIndex].id);
                    ref.current.focusAtStart();
                });
            };
            await blockD.onMoveBlock(
                {
                    currentBlock: newState.find((b) => b.id === action.id).toObj(),
                    state: newState.map((a) => a.toObj()),
                    action,
                },
                {
                    modifyBlock,
                    focusOnCurrentBlock,
                },
            );
        }
    }
    return newState;
}

// Move focus up or down between existing blocks.  Simply schedules a focus
// change callback and returns the state unchanged.
async function moveFocus({ state, action, addCallback }) {
    addCallback(({ refsMap }) => {
        let index = state.findIndex((b) => b.id === action.id);
        if (action.dir === "up") {
            let previousIndex = index - 1;
            if (previousIndex > -1) {
                let previousId = state[previousIndex].id;
                let ref = refsMap.get(previousId);
                ref.current.focusAtEnd();
            }
        } else {
            let nextIndex = index + 1;
            if (nextIndex < state.length) {
                let nextId = state[nextIndex].id;
                let ref = refsMap.get(nextId);
                ref.current.focusAtStart();
            }
        }
    });
    return state;
}

// Convert a block to a different type.  Creates a new block instance of the
// requested type and runs lifecycle hooks accordingly.
async function convertBlockType({ state, action, addCallback, blocks }) {
    let blockDef = blocks.find((bType) => bType.type === action.newBlockType);
    let block = state.find((b) => b.id === action.id);
    let blockObj = block.toObj();
    let blockIndex = state.findIndex((b) => b.id === action.id);
    let prevBlock = state[blockIndex - 1]?.toObj();
    let data = blockDef.init(prevBlock);
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
        data[keys[i]] = blockObj.data[keys[i]] ? blockObj.data[keys[i]] : data[keys[i]];
    }
    const newBlock = new Block({
        id: generateId(),
        blockid: generateBlockId(),
        type: blockDef.type,
        data: data,
        props: blockObj.props,
    });
    addCallback(({ refsMap }) => {
        // focus the new block after refs map is ready
        const ref = refsMap.get(newBlock.id);
        if (ref && ref.current) {
            ref.current.focusAtStart();
        }
    });
    let newState = [...state.slice(0, blockIndex), newBlock, ...state.slice(blockIndex + 1)];
    // Lifecycle hooks
    for (let i = 0; i < blocks.length; i++) {
        let blockD = blocks[i];
        if (typeof blockD.onConvertBlockType === "function") {
            let modifyBlock = (nBlock) => {
                let idx = newState.findIndex((b) => b.id === nBlock.id);
                newState = [
                    ...newState.slice(0, idx),
                    new Block(nBlock),
                    ...newState.slice(idx + 1),
                ];
            };
            let focusOnCurrentBlock = () => {
                addCallback(({ refsMap }) => {
                    let ref = refsMap.get(state[blockIndex].id);
                    ref.current.focusAtStart();
                });
            };
            await blockD.onConvertBlockType(
                {
                    currentBlock: newState[blockIndex].toObj(),
                    state: newState.map((a) => a.toObj()),
                    action,
                },
                {
                    modifyBlock,
                    focusOnCurrentBlock,
                },
            );
        }
    }
    return newState;
}

// Execute a menu item.  The action field on the menu item may perform
// arbitrary modifications to the block state, open editors, or request
// callbacks.  Lifecycle hooks run afterwards.
async function executeMenu({
    state,
    action,
    tools,
    blocks,
    addCallback,
    editors,
    editorFns,
}) {
    let block = state.find((b) => b.id === action.id);
    let blockObj = block.toObj();
    let newState = [...state];
    // Replace a block in newState by id, to allow updating multiple blocks
    let modifyBlock = (newBlock) => {
        const idx = newState.findIndex((b) => b.id === newBlock.id);
        if (idx !== -1) {
            newState = [
                ...newState.slice(0, idx),
                new Block(newBlock),
                ...newState.slice(idx + 1),
            ];
        }
    };
    let focusOnCurrentBlock = () => {
        addCallback(({ refsMap }) => {
            let ref = refsMap.get(action.id);
            ref.current.focusAtStart();
        });
    };
    let openEditor = (name, data) => {
        if (editors.find((e) => e.label === name)) {
            editorFns.openEditor(name, data, block);
        } else throw new Error(`Editor ${name} not found`);
    };
    await action.action(
        {
            currentBlock: blockObj,
            state: newState.map((i) => i.toObj()),
            tools,
        },
        { modifyBlock, focusOnCurrentBlock, openEditor },
    );
    // Lifecycle hooks
    for (let i = 0; i < blocks.length; i++) {
        let blockD = blocks[i];
        if (typeof blockD.onModifyRawBlock === "function") {
            await blockD.onMenuItem(
                {
                    currentBlock: blockObj,
                    state: newState.map((a) => a.toObj()),
                    action,
                },
                {
                    modifyBlock,
                    focusOnCurrentBlock,
                },
            );
        }
    }
    return newState;
}

// Replace a block instance directly with an updated one.  Useful for editors
// that modify block data wholesale.  Lifecycle hooks run afterwards.
async function modifyRawBlock({ state, action, blocks, addCallback }) {
    let newBlock = new Block(action.block);
    let blockIndex = state.findIndex((s) => s.id === action.block.id);
    let newState = [...state];
    newState = [...newState.slice(0, blockIndex), newBlock, ...newState.slice(blockIndex + 1)];
    // Lifecycle hooks
    for (let i = 0; i < blocks.length; i++) {
        let blockD = blocks[i];
        if (typeof blockD.onModifyRawBlock === "function") {
            let modifyBlock = (nBlock) => {
                let idx = newState.findIndex((b) => b.id === nBlock.id);
                newState = [
                    ...newState.slice(0, idx),
                    new Block(nBlock),
                    ...newState.slice(idx + 1),
                ];
            };
            let focusOnCurrentBlock = () => {
                addCallback(({ refsMap }) => {
                    let ref = refsMap.get(state[blockIndex].id);
                    ref.current.focusAtStart();
                });
            };
            await blockD.onModifyRawBlock(
                {
                    currentBlock: newState[blockIndex].toObj(),
                    state: newState.map((a) => a.toObj()),
                    action,
                },
                {
                    modifyBlock,
                    focusOnCurrentBlock,
                },
            );
        }
    }
    return newState;
}