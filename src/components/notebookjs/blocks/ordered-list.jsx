import React, { forwardRef } from "react";
import BaseTextEditor from "../components/base-text-editor";

const MAX_INDENT = 4;

const OrderedListBlock = forwardRef(function (
    {
        id = "",
        readOnly = false,
        data = {},
        props = {},
        tools = [],
        references = {
            search: () => {},
            open: () => {},
        },
        shortcuts = [],
        dispatcher = () => {},
    },
    ref,
) {
    let indentation = Math.max(1, data.indentation || 1);
    let numbering = data.numbering;

    let number = calculateNumber(numbering);

    return (
        <div className="flex flex-grow mx-2 cursor-text relative py-0">
            <div
                className={`flex-shrink-0 text-right flex items-baseline justify-end mr-2 select-none`}
                style={{ marginLeft: `${indentation * 0.5}rem` }}
            >
                <span className="text-muted-foreground text-xs font-mono h-8 flex items-center justify-center">
                    {number}
                </span>
            </div>
            <div className="relative flex-1">
                <BaseTextEditor
                    id={id}
                    iText={data.text || ""}
                    iInlineStyles={data.inlineStyles || []}
                    blockType={OrderedListBlock}
                    placeholder="Type ordered list text...."
                    tools={tools}
                    references={references}
                    readOnly={readOnly}
                    shortcuts={shortcuts}
                    props={props}
                    dispatcher={dispatcher}
                    ref={ref}
                />
            </div>
        </div>
    );
});

OrderedListBlock.label = "Ordered List";
OrderedListBlock.icon = "OL";
OrderedListBlock.type = "ordered-list";
OrderedListBlock.shortcut = "Cmd+O";
OrderedListBlock.init = (prevBlock) => {
    let indentation = 1;
    if (prevBlock?.type === "ordered-list")
        indentation = prevBlock?.data.indentation;
    let numbering = new Array(MAX_INDENT).fill(0);
    return {
        text: "",
        inlineStyles: [],
        indentation,
        numbering,
        manual: false,
    };
};
OrderedListBlock.menuItems = [
    {
        name: "Increase Indentation",
        shortcut: "Tab",
        action: ({ currentBlock }, { modifyBlock }) => {
            if (currentBlock.data.manual !== true) {
                let currentIndentation = currentBlock.data.indentation;
                if (currentIndentation >= MAX_INDENT) return;
                modifyBlock({
                    ...currentBlock,
                    data: {
                        ...currentBlock.data,
                        indentation: currentBlock.data.indentation + 1,
                    },
                });
            }
        },
    },
    {
        name: "Decrease Indentation",
        shortcut: "Tab+Shift",
        action: ({ currentBlock }, { modifyBlock }) => {
            if (currentBlock.data.manual !== true) {
                let currentIndentation = currentBlock.data.indentation;
                if (currentIndentation <= 1) return;
                modifyBlock({
                    ...currentBlock,
                    data: {
                        ...currentBlock.data,
                        indentation: currentBlock.data.indentation - 1,
                    },
                });
            }
        },
    },
    {
        name: "Set Numbering",
        action: ({ currentBlock, state }, { modifyBlock, openEditor }) => {
            openEditor("set-numbering", {
                calc: calculateNumber,
                max: MAX_INDENT,
                modifyOrderedListBlocks: () =>
                    modifyOrderedListBlocksFrom(
                        currentBlock,
                        state,
                        modifyBlock,
                    ),
            });
        },
    },
];
OrderedListBlock.followingBlock = "ordered-list";

OrderedListBlock.onCreateNewBlock = (
    { currentBlock, state },
    { modifyBlock },
) => modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock);
OrderedListBlock.onDeleteBlock = ({ currentBlock, state }, { modifyBlock }) =>
    modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock);
OrderedListBlock.onMoveBlock = ({ currentBlock, state }, { modifyBlock }) =>
    modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock, () =>
        state.findIndex((b) => b.id === currentBlock.id) - 1 >= 0
            ? state.findIndex((b) => b.id === currentBlock.id) - 1
            : 0,
    );
OrderedListBlock.onConvertBlockType = (
    { currentBlock, state, action },
    { modifyBlock },
) =>
    modifyOrderedListBlocksFrom(
        currentBlock,
        state,
        modifyBlock,
        undefined,
        () =>
            action.oldBlockType === "ordered-list" ||
            currentBlock.type === "ordered-list",
    );
OrderedListBlock.onModifyRawBlock = (
    { currentBlock, state },
    { modifyBlock },
) => modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock);
OrderedListBlock.onMenuItem = (
    { action, currentBlock, state },
    { modifyBlock },
) => {
    if (
        action.name === "Increase Indentation" ||
        action.name === "Decrease Indentation"
    ) {
        modifyOrderedListBlocksFrom(currentBlock, state, modifyBlock);
    }
};

function modifyOrderedListBlocksFrom(
    currentBlock,
    state,
    modifyBlock,
    indexFn,
    checkFn,
) {
    if (
        typeof checkFn === "function"
            ? checkFn()
            : currentBlock.type === "ordered-list"
    ) {
        let index =
            typeof indexFn === "function"
                ? indexFn()
                : state.findIndex((b) => b.id === currentBlock.id);
        let lastNumbering = [...new Array(MAX_INDENT).fill(0)];
        for (let i = index - 1; i >= 0; i--) {
            let block = state[i];
            if (block.type === "ordered-list") {
                lastNumbering = [...block.data.numbering];
                break;
            }
        }
        for (let i = index; i < state.length; i++) {
            let block = state[i];
            if (block?.type === "ordered-list" && block?.data.manual !== true) {
                lastNumbering[block.data.indentation - 1] += 1;
                let rest = MAX_INDENT - block.data.indentation + 1;
                for (let i = 1; i < rest; i++) {
                    lastNumbering[block.data.indentation + i - 1] = 0;
                }
                modifyBlock({
                    ...block,
                    data: {
                        ...block.data,
                        numbering: [...lastNumbering],
                    },
                });
            }
        }
    }
}

function calculateNumber(numbering) {
    if (numbering.every((a) => a === 0)) return "0";
    let i = numbering.length - 1;
    while (i >= 0 && numbering[i] === 0) {
        i--;
    }
    return numbering.slice(0, i + 1).join(".");
}

export default OrderedListBlock;
