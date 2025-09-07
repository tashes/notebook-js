import { Block } from "../data/block";
import { generateBlockId, generateId } from "./ids";
import type { ReducerEnv } from "./actions";

// Keep any-typed params initially to enable incremental TS migration
export async function reducer(p: ReducerEnv): Promise<import("../data/block").Block[]> {
  const {
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
      return await convertBlockType({ ...p });
    case "menu-execution":
      return await executeMenu({ ...p });
    case "base-text-update":
      return await baseTextUpdate({ ...p });
    case "block-delete":
      return await deleteBlock({ ...p });
    case "block-move":
      return await moveBlock({ ...p });
    case "focus-move":
      return await moveFocus({ ...p });
    case "create-new-block":
      return await createNewBlock({ ...p });
    case "modify-raw-block":
      return await modifyRawBlock({ ...p });
    default:
      console.error(`Unknown action: ${action.type}`);
      break;
  }
  return state;
}

async function createNewBlock({ state, action, blocks, initProps, addCallback }: Pick<ReducerEnv, "state"|"action"|"blocks"|"initProps"|"addCallback">) {
  const currentBlock = state.find((b: any) => b.id === action.id);
  const blockDef = blocks.find((b: any) => b.type === action.blockType);
  const newBlock = new Block({
    id: generateId(),
    blockid: generateBlockId(),
    type: blockDef.type,
    data: blockDef.init(currentBlock),
    props: initProps(),
  });
  const currentIndex = state.findIndex((b: any) => b.id === action.id);
  if (currentIndex === -1) return [...state, newBlock];
  const insertIndex = action.position === "before" ? currentIndex : currentIndex + 1;
  addCallback(({ refsMap: newRefs }: any) => {
    const ref = newRefs.get(newBlock.id);
    if (ref && ref.current) ref.current.focusAtStart();
  });
  let newState = [...state.slice(0, insertIndex), newBlock, ...state.slice(insertIndex)];
  for (let i = 0; i < blocks.length; i++) {
    const blockD = blocks[i];
    if (typeof blockD.onCreateNewBlock === "function") {
      let modifyBlock = (nBlock: any) => {
        const index = newState.findIndex((b: any) => b.id === nBlock.id);
        newState = [
          ...newState.slice(0, index),
          new Block(nBlock),
          ...newState.slice(index + 1),
        ];
      };
      let focusOnCurrentBlock = () => {
        addCallback(({ refsMap }: any) => {
          const ref = refsMap.get(newBlock.id);
          ref.current.focusAtStart();
        });
      };
      await blockD.onCreateNewBlock(
        { currentBlock: newBlock.toObj(), state: newState.map((a: any) => a.toObj()), action },
        { modifyBlock, focusOnCurrentBlock },
      );
    }
  }
  return newState;
}

async function deleteBlock({ state, action, blocks, initProps, addCallback }: Pick<ReducerEnv, "state"|"action"|"blocks"|"initProps"|"addCallback">) {
  const index = state.findIndex((block: any) => block.id === action.id);
  const currentBlock = state[index];
  if (index === -1) return state;
  let newState = state.filter((block: any) => block.id !== action.id);
  const newStateLength = newState.length;
  if (newStateLength > 0) {
    addCallback(({ refsMap: newRefs }: any) => {
      if (index < newStateLength) {
        const nextBlockId = newState[index].id;
        const ref = newRefs.get(nextBlockId);
        if (ref && ref.current) ref.current.focusAtStart();
      } else {
        const prevBlockId = newState[newStateLength - 1].id;
        const ref = newRefs.get(prevBlockId);
        if (ref && ref.current) ref.current.focusAtEnd();
      }
    });
  }
  for (let i = 0; i < blocks.length; i++) {
    const blockD = blocks[i];
    if (typeof blockD.onDeleteBlock === "function") {
      let modifyBlock = (nBlock: any) => {
        const idx = newState.findIndex((b: any) => b.id === nBlock.id);
        newState = [
          ...newState.slice(0, idx),
          new Block(nBlock),
          ...newState.slice(idx + 1),
        ];
      };
      let focusOnCurrentBlock = () => {};
      await blockD.onDeleteBlock(
        { currentBlock: currentBlock.toObj(), state: newState.map((a: any) => a.toObj()), action },
        { modifyBlock, focusOnCurrentBlock },
      );
    }
  }
  return newState;
}

async function baseTextUpdate({ state, blocks, action, addCallback }: Pick<ReducerEnv, "state"|"blocks"|"action"|"addCallback">) {
  const block = state.find((b: any) => b.id === action.id);
  const blockIndex = state.findIndex((b: any) => b.id === action.id);
  const blockObj = block.toObj();
  const newBlock = new Block({
    ...blockObj,
    data: { ...blockObj.data, text: action.text, inlineStyles: action.inlineStyles },
  });
  let newState = [...state.slice(0, blockIndex), newBlock, ...state.slice(blockIndex + 1)];
  for (let i = 0; i < blocks.length; i++) {
    const blockD = blocks[i];
    if (typeof blockD.onBaseTextUpdate === "function") {
      let modifyBlock = (nBlock: any) => {
        const idx = newState.findIndex((b: any) => b.id === nBlock.id);
        newState = [
          ...newState.slice(0, idx),
          new Block(nBlock),
          ...newState.slice(idx + 1),
        ];
      };
      let focusOnCurrentBlock = () => {
        addCallback(({ refsMap }: any) => {
          const ref = refsMap.get(newBlock.id);
          ref.current.focusAtStart();
        });
      };
      await blockD.onBaseTextUpdate(
        { currentBlock: newBlock.toObj(), state: state.map((a: any) => a.toObj()), action },
        { modifyBlock, focusOnCurrentBlock },
      );
    }
  }
  return newState;
}

async function moveBlock({ state, action, blocks, addCallback, refsMap }: Pick<ReducerEnv, "state"|"action"|"blocks"|"addCallback"|"refsMap">) {
  const blockIndex = state.findIndex((b: any) => b.id === action.id);
  const ref = refsMap.get(action.id);
  const position = ref.current.getCurrentPosition();
  let newState = [...state];
  addCallback(({ refsMap: newRefs }: any) => {
    const ref2 = newRefs.get(action.id);
    ref2.current.focusAt(position);
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
  for (let i = 0; i < blocks.length; i++) {
    const blockD = blocks[i];
    if (typeof blockD.onMoveBlock === "function") {
      let modifyBlock = (nBlock: any) => {
        const idx = newState.findIndex((b: any) => b.id === nBlock.id);
        newState = [
          ...newState.slice(0, idx),
          new Block(nBlock),
          ...newState.slice(idx + 1),
        ];
      };
      let focusOnCurrentBlock = () => {
        addCallback(({ refsMap }: any) => {
          const ref3 = refsMap.get(state[blockIndex].id);
          ref3.current.focusAtStart();
        });
      };
      await blockD.onMoveBlock(
        { currentBlock: newState.find((b: any) => b.id === action.id).toObj(), state: newState.map((a: any) => a.toObj()), action },
        { modifyBlock, focusOnCurrentBlock },
      );
    }
  }
  return newState;
}

async function moveFocus({ state, action, addCallback }: Pick<ReducerEnv, "state"|"action"|"addCallback">) {
  addCallback(({ refsMap }: any) => {
    const index = state.findIndex((b: any) => b.id === action.id);
    if (action.dir === "up") {
      const previousIndex = index - 1;
      if (previousIndex > -1) {
        const previousId = state[previousIndex].id;
        const ref = refsMap.get(previousId);
        ref.current.focusAtEnd();
      }
    } else {
      const nextIndex = index + 1;
      if (nextIndex < state.length) {
        const nextId = state[nextIndex].id;
        const ref = refsMap.get(nextId);
        ref.current.focusAtStart();
      }
    }
  });
  return state;
}

async function convertBlockType({ state, action, addCallback, blocks }: Pick<ReducerEnv, "state"|"action"|"addCallback"|"blocks">) {
  const blockDef = blocks.find((bType: any) => bType.type === action.newBlockType);
  const block = state.find((b: any) => b.id === action.id);
  const blockObj = block.toObj();
  const blockIndex = state.findIndex((b: any) => b.id === action.id);
  const prevBlock = state[blockIndex - 1]?.toObj();
  const data = blockDef.init(prevBlock);
  const keys = Object.keys(data);
  for (let i = 0; i < keys.length; i++) {
    (data as any)[keys[i]] = blockObj.data[keys[i]] ? blockObj.data[keys[i]] : (data as any)[keys[i]];
  }
  const newBlock = new Block({
    id: generateId(),
    blockid: generateBlockId(),
    type: blockDef.type,
    data: data,
    props: blockObj.props,
  });
  addCallback(({ refsMap }: any) => {
    const ref = refsMap.get(newBlock.id);
    if (ref && ref.current) ref.current.focusAtStart();
  });
  let newState = [...state.slice(0, blockIndex), newBlock, ...state.slice(blockIndex + 1)];
  for (let i = 0; i < blocks.length; i++) {
    const blockD = blocks[i];
    if (typeof blockD.onConvertBlockType === "function") {
      let modifyBlock = (nBlock: any) => {
        const idx = newState.findIndex((b: any) => b.id === nBlock.id);
        newState = [
          ...newState.slice(0, idx),
          new Block(nBlock),
          ...newState.slice(idx + 1),
        ];
      };
      let focusOnCurrentBlock = () => {
        addCallback(({ refsMap }: any) => {
          const ref2 = refsMap.get(state[blockIndex].id);
          ref2.current.focusAtStart();
        });
      };
      await blockD.onConvertBlockType(
        { currentBlock: newState[blockIndex].toObj(), state: newState.map((a: any) => a.toObj()), action },
        { modifyBlock, focusOnCurrentBlock },
      );
    }
  }
  return newState;
}

async function executeMenu({ state, action, tools, blocks, addCallback, editors, editorFns }: Pick<ReducerEnv, "state"|"action"|"tools"|"blocks"|"addCallback"|"editors"|"editorFns">) {
  const block = state.find((b: any) => b.id === action.id);
  const blockObj = block.toObj();
  let newState = [...state];
  const modifyBlock = (newBlock: any) => {
    const idx = newState.findIndex((b: any) => b.id === newBlock.id);
    if (idx !== -1) {
      newState = [...newState.slice(0, idx), new Block(newBlock), ...newState.slice(idx + 1)];
    }
  };
  const focusOnCurrentBlock = () => {
    addCallback(({ refsMap }: any) => {
      const ref = refsMap.get(action.id);
      ref.current.focusAtStart();
    });
  };
  const openEditor = (name: string, data: unknown) => {
    if (editors.find((e: any) => e.label === name)) editorFns.openEditor(name, data, block);
    else throw new Error(`Editor ${name} not found`);
  };
  await action.action({ currentBlock: blockObj, state: newState.map((i: any) => i.toObj()), tools }, { modifyBlock, focusOnCurrentBlock, openEditor });
  for (let i = 0; i < blocks.length; i++) {
    const blockD = blocks[i];
    if (typeof blockD.onModifyRawBlock === "function") {
      await blockD.onMenuItem(
        { currentBlock: blockObj, state: newState.map((a: any) => a.toObj()), action },
        { modifyBlock, focusOnCurrentBlock },
      );
    }
  }
  return newState;
}

async function modifyRawBlock({ state, action, blocks, addCallback }: Pick<ReducerEnv, "state"|"action"|"blocks"|"addCallback">) {
  const newBlock = new Block(action.block);
  const blockIndex = state.findIndex((s: any) => s.id === action.block.id);
  let newState = [...state];
  newState = [...newState.slice(0, blockIndex), newBlock, ...newState.slice(blockIndex + 1)];
  for (let i = 0; i < blocks.length; i++) {
    const blockD = blocks[i];
    if (typeof blockD.onModifyRawBlock === "function") {
      let modifyBlock = (nBlock: any) => {
        const idx = newState.findIndex((b: any) => b.id === nBlock.id);
        newState = [...newState.slice(0, idx), new Block(nBlock), ...newState.slice(idx + 1)];
      };
      let focusOnCurrentBlock = () => {
        addCallback(({ refsMap }: any) => {
          const ref = refsMap.get(state[blockIndex].id);
          ref.current.focusAtStart();
        });
      };
      await blockD.onModifyRawBlock(
        { currentBlock: newState[blockIndex].toObj(), state: newState.map((a: any) => a.toObj()), action },
        { modifyBlock, focusOnCurrentBlock },
      );
    }
  }
  return newState;
}
