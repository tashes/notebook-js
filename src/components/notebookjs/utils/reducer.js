import { Block } from "../data/block";
import { generateBlockId, generateId } from "./ids";

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
            // console.log(`Converting ${action.id} ${action.oldBlockType} into ${action.newBlockType}`);
            return await convertBlockType({
                ...p,
            });
        case "menu-execution":
            // console.log(`Running ${action.name} (${action.action}) for ${action.id}`,);
            return await executeMenu({
                ...p,
            });
        case "base-text-update":
            // console.log(`Updating base text for ${action.id} with ${action.text} and ${JSON.stringify(action.inlineStyles, null, 4)}`,);
            return await baseTextUpdate({
                ...p,
            });
        case "block-delete": {
            // console.log(`Delete block ${action.id}`);
            return await deleteBlock({
                ...p,
            });
        }
        case "block-move":
            // console.log(`Moving block ${action.id} in direction ${action.dir}`);
            return await moveBlock({
                ...p,
            });
        case "focus-move":
            // console.log(`Moving focus ${action.dir} from ${action.id}`);
            return await moveFocus({
                ...p,
            });
        case "create-new-block": {
            // console.log(`Creating a new ${action.blockType} block ${action.position} ${action.id}`);
            return await createNewBlock({
                ...p,
            });
        }
        case "modify-raw-block": {
            // console.log(`Modifying raw block: ${JSON.stringify(action.block)}`);
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
    let insertIndex =
        action.position === "before" ? currentIndex : currentIndex + 1;
    // Move focus to new Block
    addCallback(({ refsMap: newRefs }) => {
        const ref = newRefs.get(newBlock.id);
        if (ref && ref.current) {
            ref.current.focusAtStart();
        }
    });
    // New state
    let newState = [
        ...state.slice(0, insertIndex),
        newBlock,
        ...state.slice(insertIndex),
    ];
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

async function deleteBlock({ state, action, blocks, initProps, addCallback }) {
    let index = state.findIndex((block) => block.id === action.id);
    let currentBlock = state[index];
    // Return state if block id is not found
    if (index === -1) return state;
    // Check if it's the only block
    let newState = state;
    if (state.length === 1) {
        let newBlock = new Block({
            id: generateId(),
            blockid: generateBlockId(),
            type: blocks[0].type,
            data: blocks[0].init(),
            props: initProps(),
        });
        newState = [...newState, newBlock];
    }
    const newStateLength = newState.length;
    addCallback(({ refsMap: newRefs }) => {
        // Manage focus - move to the next block, if last block then move to the previous block
        if (index < newStateLength - 1) {
            // Move to the next block
            const nextBlockId = newState[index].id;
            const ref = newRefs.get(nextBlockId);
            if (ref && ref.current) {
                ref.current.focusAtStart();
            }
        } else {
            // Move to the previous block
            const prevBlockId = newState[index - 1].id;
            const ref = newRefs.get(prevBlockId);
            if (ref && ref.current) {
                ref.current.focusAtEnd();
            }
        }
    });
    // Filter state without current block
    newState = newState.filter((block) => block.id !== action.id);
    // Lifecycle hooks
    for (let i = 0; i < blocks.length; i++) {
        let blockD = blocks[i];
        if (typeof blockD.onDeleteBlock === "function") {
            let modifyBlock = (nBlock) => {
                let index = newState.findIndex((b) => b.id === nBlock.id);
                newState = [
                    ...newState.slice(0, index),
                    new Block(nBlock),
                    ...newState.slice(index + 1),
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
    let newState = [
        ...state.slice(0, blockIndex),
        newBlock,
        ...state.slice(blockIndex + 1),
    ];
    // Lifecycle hooks
    for (let i = 0; i < blocks.length; i++) {
        let blockD = blocks[i];
        if (typeof blockD.onBaseTextUpdate === "function") {
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
                let index = newState.findIndex((b) => b.id === nBlock.id);
                newState = [
                    ...newState.slice(0, index),
                    new Block(nBlock),
                    ...newState.slice(index + 1),
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
                    currentBlock: newState
                        .find((b) => b.id === action.id)
                        .toObj(),
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

async function convertBlockType({ state, action, addCallback, blocks }) {
    let blockDef = blocks.find((bType) => bType.type === action.newBlockType);
    let block = state.find((b) => b.id === action.id);
    let blockObj = block.toObj();
    let blockIndex = state.findIndex((b) => b.id === action.id);
    let prevBlock = state[blockIndex - 1]?.toObj();
    let data = blockDef.init(prevBlock);
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
        data[keys[i]] = blockObj.data[keys[i]]
            ? blockObj.data[keys[i]]
            : data[keys[i]];
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
    let newState = [
        ...state.slice(0, blockIndex),
        newBlock,
        ...state.slice(blockIndex + 1),
    ];
    // Lifecycle hooks
    for (let i = 0; i < blocks.length; i++) {
        let blockD = blocks[i];
        if (typeof blockD.onConvertBlockType === "function") {
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

async function modifyRawBlock({ state, action, blocks, addCallback }) {
    let newBlock = new Block(action.block);
    let blockIndex = state.findIndex((s) => s.id === action.block.id);
    let newState = [...state];
    newState = [
        ...newState.slice(0, blockIndex),
        newBlock,
        ...newState.slice(blockIndex + 1),
    ];
    // Lifecycle hooks
    for (let i = 0; i < blocks.length; i++) {
        let blockD = blocks[i];
        if (typeof blockD.onModifyRawBlock === "function") {
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
