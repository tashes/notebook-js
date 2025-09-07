import React, { createRef } from "react";
import BlockType from "../block-type";
import MenuBar from "../menu-bar";
import { deepEquals } from "../../utils/draft-helpers";
import { useNotebook } from "../../context";

type Props = {
  block: any;
  readOnly: boolean;
  shortcuts: any[];
  openReference: any;
  searchReferences: any;
};

function NotebookBlock(props: Props) {
  const { block, readOnly, shortcuts, openReference, searchReferences } = props;
  const ctx = useNotebook();
  const { blocks, tools, menuItems, dispatcher, editors, editorFns } = ctx;
  const refsMap = { current: ctx.refsMap } as React.MutableRefObject<Map<string, React.RefObject<any>>>;

  if (!refsMap.current.has(block.id)) {
    refsMap.current.set(block.id, createRef());
  }
  const editorRef = refsMap.current.get(block.id)!;

  const openEditor = (name: string, data: unknown) => {
    if (!editors.find((e) => e.label === name)) {
      throw new Error(`Editor "${name}" not found`);
    }
    editorFns.openEditor(name, data, block);
  };

  const Def = blocks.find((b) => b.type === block.type);
  const blockMenuItems = (Def.menuItems || [])
    .filter((mi: any) => mi.shortcut)
    .map((mi: any) => ({
      shortcut: mi.shortcut,
      action: ({ id, dispatcher }: any) => {
        dispatcher({ type: "menu-execution", id, name: mi.name, action: mi.action });
      },
    }));
  const combinedShortcuts = [...shortcuts, ...blockMenuItems];

  const DefComp = Def as any;
  return (
    <div className="block-wrapper relative w-full overflow-hidden" key={block.id}>
      <div className="block-editor w-full overflow-hidden p-1 rounded-md transition-colors group flex flex-row text-sm hover:bg-muted">
        <div className="w-9 p-0 mr-1">
          <BlockType id={block.id} readOnly={readOnly} type={block.type} />
        </div>
        <div className="flex-1 mr-1 overflow-hidden">
          <DefComp
            id={block.id}
            readOnly={readOnly}
            blockid={block.blockid}
            data={block.data}
            props={block.props}
            block={block.toObj()}
            tools={tools}
            references={{ search: searchReferences, open: openReference }}
            shortcuts={combinedShortcuts}
            dispatcher={dispatcher}
            ref={editorRef}
            openEditor={openEditor}
          />
        </div>
        <div className="w-9 p-0 m-0">
          <MenuBar id={block.id} readOnly={readOnly} blockItems={Def.menuItems} />
        </div>
      </div>
    </div>
  );
}

const areEqual = (prev: Props, next: Props) => {
  return (
    prev.readOnly === next.readOnly &&
    prev.dispatcher === next.dispatcher &&
    prev.block.id === next.block.id &&
    prev.block.blockid === next.block.blockid &&
    deepEquals(prev.block.data, next.block.data) &&
    deepEquals(prev.block.props, next.block.props)
  );
};

export default React.memo(NotebookBlock, areEqual);
