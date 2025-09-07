import React, { forwardRef } from "react";
import BaseTextEditor from "../components/base-text-editor";

const MAX_INDENT = 4;

const OrderedListBlock = forwardRef<any, any>(function (
  { id = "", readOnly = false, data = {}, props = {}, tools = [], references = { search: () => {}, open: () => {} }, shortcuts = [], dispatcher = () => {} },
  ref,
) {
  const indentation = Math.max(1, (data as any).indentation || 1);
  const numbering = (data as any).numbering;
  const number = calculateNumber(numbering);
  return (
    <div className="flex flex-grow mx-2 cursor-text relative py-0">
      <div className={`flex-shrink-0 text-right flex items-baseline justify-end mr-2 select-none`} style={{ marginLeft: `${indentation * 0.5}rem` }}>
        <span className="text-muted-foreground text-xs font-mono h-8 flex items-center justify-center">{number}</span>
      </div>
      <div className="relative flex-1">
        <BaseTextEditor
          id={id}
          iText={(data as any).text || ""}
          iInlineStyles={(data as any).inlineStyles || []}
          blockType={OrderedListBlock}
          placeholder="Type ordered list text...."
          references={references}
          readOnly={readOnly}
          shortcuts={shortcuts}
          props={props}
          ref={ref}
        />
      </div>
    </div>
  );
});

(OrderedListBlock as any).label = "Ordered List";
(OrderedListBlock as any).icon = "OL";
(OrderedListBlock as any).type = "ordered-list";
(OrderedListBlock as any).shortcut = "Cmd+O";
(OrderedListBlock as any).init = (prevBlock: any) => {
  let indentation = 1;
  if (prevBlock?.type === "ordered-list") indentation = prevBlock?.data.indentation;
  let numbering = new Array(MAX_INDENT).fill(0);
  return { text: "", inlineStyles: [], indentation, numbering, manual: false };
};
(OrderedListBlock as any).menuItems = [
  { name: "Increase Indentation", shortcut: "Tab", action: ({ currentBlock }: any, { modifyBlock }: any) => {
      if (currentBlock.data.manual !== true) {
        const currentIndentation = currentBlock.data.indentation;
        if (currentIndentation >= MAX_INDENT) return;
        modifyBlock({ ...currentBlock, data: { ...currentBlock.data, indentation: currentBlock.data.indentation + 1 } });
      }
    },
  },
  { name: "Decrease Indentation", shortcut: "Tab+Shift", action: ({ currentBlock }: any, { modifyBlock }: any) => {
      if (currentBlock.data.manual !== true) {
        const currentIndentation = currentBlock.data.indentation;
        if (currentIndentation <= 1) return;
        modifyBlock({ ...currentBlock, data: { ...currentBlock.data, indentation: currentBlock.data.indentation - 1 } });
      }
    },
  },
  { name: "Set Numbering", action: ({ currentBlock, state }: any, { modifyBlock, openEditor }: any) => {
      openEditor("set-numbering", { calc: calculateNumber, max: MAX_INDENT, modifyOrderedListBlocks: () => modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock) });
    },
  },
];
(OrderedListBlock as any).followingBlock = "ordered-list";

(OrderedListBlock as any).onCreateNewBlock = ({ currentBlock, state }: any, { modifyBlock }: any) => modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock);
(OrderedListBlock as any).onDeleteBlock = ({ currentBlock, state }: any, { modifyBlock }: any) => modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock);
(OrderedListBlock as any).onMoveBlock = ({ currentBlock, state }: any, { modifyBlock }: any) =>
  modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock, () => (state.findIndex((b: any) => b.id === currentBlock.id) - 1 >= 0 ? state.findIndex((b: any) => b.id === currentBlock.id) - 1 : 0));
(OrderedListBlock as any).onConvertBlockType = ({ currentBlock, state, action }: any, { modifyBlock }: any) =>
  modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock, undefined, () => action.oldBlockType === "ordered-list" || currentBlock.type === "ordered-list");
(OrderedListBlock as any).onModifyRawBlock = ({ currentBlock, state }: any, { modifyBlock }: any) => modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock);
(OrderedListBlock as any).onMenuItem = ({ action, currentBlock, state }: any, { modifyBlock }: any) => {
  if (action.name === "Increase Indentation" || action.name === "Decrease Indentation") modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock);
};

function modifyOrderedListBlocksFrom(currentBlock: any, state: any[], modifyBlock: (b: any) => void, indexFn?: () => number, checkFn?: () => boolean) {
  if (typeof checkFn === "function" ? checkFn() : currentBlock.type === "ordered-list") {
    const index = typeof indexFn === "function" ? indexFn() : state.findIndex((b: any) => b.id === currentBlock.id);
    let lastNumbering = [...new Array(MAX_INDENT).fill(0)];
    for (let i = index - 1; i >= 0; i--) {
      let block = state[i];
      if (block.type === "ordered-list") { lastNumbering = [...block.data.numbering]; break; }
    }
    for (let i = index; i < state.length; i++) {
      let block = state[i];
      if (block?.type === "ordered-list" && block?.data.manual !== true) {
        lastNumbering[block.data.indentation - 1] += 1;
        let rest = MAX_INDENT - block.data.indentation + 1;
        for (let i = 1; i < rest; i++) lastNumbering[block.data.indentation + i - 1] = 0;
        modifyBlock({ ...block, data: { ...block.data, numbering: [...lastNumbering] } });
      }
    }
  }
}

function calculateNumber(numbering: number[]) {
  if (numbering.every((a) => a === 0)) return "0";
  let i = numbering.length - 1;
  while (i >= 0 && numbering[i] === 0) i--;
  return numbering.slice(0, i + 1).join(".");
}

export default OrderedListBlock as any;
