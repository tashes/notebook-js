import React, { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Block } from "./data/block";
import { generateId, generateBlockId } from "./utils/ids";
import { reducer } from "./utils/reducer";
import NotebookBlock from "./components/notebook-block";
import Editor from "./components/editor";
import ParagraphBlock from "./blocks/paragraph";
import BoldTool from "./tools/bold";
import { Button } from "./ui/button";
import { NotebookProvider } from "./context";
import type { NotebookJSProps, BlockRaw } from "./types";

const defaultBlockTypes: any[] = [ParagraphBlock as any];
const defaultTools: any[] = [BoldTool as any];
const defaultMenuItems: any[] = [];
const defaultEditors: any[] = [];

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
}: NotebookJSProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorData, setEditorData] = useState<{
    name: string;
    data: any;
    currentBlockId?: string;
  }>({ name: "", data: {}, currentBlockId: undefined });

  const editorFns = useMemo(
    () => ({
      openEditor: (editor: string, data: unknown, block?: { id: string }) => {
        setEditorData({ name: editor, data, currentBlockId: block?.id });
        setIsEditorOpen(true);
      },
      closeEditor: () => {
        setIsEditorOpen(false);
        setEditorData({ name: "", data: {}, currentBlockId: undefined });
      },
    }),
    [],
  );

  const modifyBlock = (block: BlockRaw) => {
    dispatchNotebookBlocks({ type: "modify-raw-block", block });
  };

  const refsMap = useRef(new Map<string, React.RefObject<any>>());
  const notebookBlocks = blocks.map((b) => new Block(b as any));

  const [focusRequest, setFocusRequest] = useState<{
    id: string;
    where: "start" | "end";
  } | null>(null);
  const dispatchNotebookBlocks = async (action: any) => {
    const currentBlocks = blocks.map((b) => new Block(b as any));
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
      addCallback: () => {},
      editorFns,
      dispatcher: dispatchNotebookBlocks,
    });
    const newBlocks = result.map((block: any) => block.toObj());
    onChange(newBlocks);

    if (action.type === "create-new-block") {
      const oldIds = new Set(currentBlocks.map((b: any) => b.id));
      const added = result.find((b: any) => !oldIds.has(b.id));
      if (added) {
        setFocusRequest({ id: added.id, where: "start" });
      }
    }

    if (action.type === "focus-move") {
      const ids = result.map((b: any) => b.id);
      const idx = ids.indexOf(action.id);
      if (idx !== -1) {
        let targetId: string | undefined;
        if (action.dir === "up" && idx > 0) targetId = ids[idx - 1];
        else if (action.dir === "down" && idx < ids.length - 1)
          targetId = ids[idx + 1];
        if (targetId)
          setFocusRequest({
            id: targetId,
            where: action.dir === "up" ? "end" : "start",
          });
      }
    }
  };

  useEffect(() => {
    if (!focusRequest) return;
    const { id, where } = focusRequest;
    const ref = refsMap.current.get(id);
    if (ref?.current) {
      if (where === "start") ref.current.focusAtStart?.();
      else ref.current.focusAtEnd?.();
    }
    setFocusRequest(null);
  }, [focusRequest]);

  useEffect(() => {
    const aliveIds = new Set(blocks.map((b) => (b as any).id));
    for (const key of refsMap.current.keys()) {
      if (!aliveIds.has(key)) refsMap.current.delete(key);
    }
  }, [blocks]);

  const shortcuts = useMemo(() => {
    const blockTypeShortcuts = (blockTypes as any[])
      .filter((blockType) => blockType.shortcut)
      .map((blockType) => ({
        shortcut: blockType.shortcut,
        action: ({ id, blockType: oldBlock, dispatcher }: any) => {
          dispatcher({
            type: "block-type-conversion",
            id,
            oldBlockType: oldBlock.type,
            newBlockType: blockType.type,
          });
        },
      }));
    const menuItemShortcuts = (menuItems as any[])
      .filter((menuItem) => menuItem.shortcut)
      .map((menuItem) => ({
        shortcut: menuItem.shortcut,
        action: ({ id, dispatcher }: any) => {
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
      <NotebookProvider
        value={{
          blocks: blockTypes as any,
          tools: tools as any,
          editors: editors as any,
          menuItems: menuItems as any,
          dispatcher: dispatchNotebookBlocks,
          editorFns: editorFns as any,
          refsMap: refsMap.current,
        }}
      >
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
                      type: (blockTypes as any[])[0].type,
                      data: (blockTypes as any[])[0].init(),
                      props: initProps(),
                    } as any);
                    onChange([newBlock.toObj()]);
                  }}
                >
                  Create{" "}
                  {(blockTypes as any[])[0].label ||
                    (blockTypes as any[])[0].name ||
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
                  shortcuts={shortcuts as any}
                  openReference={openReference as any}
                  searchReferences={searchReferences as any}
                />
              ))
            )}
          </div>
        </div>
      </NotebookProvider>
      {isEditorOpen &&
        createPortal(
          <Editor
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
