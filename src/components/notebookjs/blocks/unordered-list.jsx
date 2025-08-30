import React from "react";
import BaseTextEditor from "../components/base-text-editor";
import { forwardRef } from "react";

const BULLET_CHARACTERS = ["•", "◦", "⦿", "⦾", "⁃", "‣"];
const MAX_INDENT = 6;

const UnorderedListBlock = forwardRef(function (
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
    let bulletIndex = (indentation - 1) % BULLET_CHARACTERS.length;
    let bulletCharacter = BULLET_CHARACTERS[bulletIndex];
    return (
        <div className="flex flex-grow mx-2 cursor-text relative py-0">
            <div
                className={`flex-shrink-0 text-right flex items-baseline justify-end mr-2 select-none`}
                style={{ marginLeft: `${indentation * 0.5}rem` }}
            >
                <span className="text-muted-foreground font-mono h-8 flex items-center justify-center">
                    {bulletCharacter}
                </span>
            </div>
            <div className="relative flex-1">
                <BaseTextEditor
                    id={id}
                    iText={data.text || ""}
                    iInlineStyles={data.inlineStyles || []}
                    blockType={UnorderedListBlock}
                    placeholder="Type unordered list text...."
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

UnorderedListBlock.label = "Unordered List";
UnorderedListBlock.icon = "UL";
UnorderedListBlock.type = "unordered-list";
UnorderedListBlock.shortcut = "Cmd+U";
UnorderedListBlock.init = (prevBlock) => {
    let indentation = 1;
    if (prevBlock?.type === "unordered-list")
        indentation = prevBlock?.data.indentation;
    return {
        text: "",
        inlineStyles: [],
        indentation,
    };
};
UnorderedListBlock.menuItems = [
    {
        name: "Increase Indentation",
        shortcut: "Tab",
        action: ({ currentBlock }, { modifyBlock }) => {
            let currentIndentation = currentBlock.data.indentation;
            if (currentIndentation >= MAX_INDENT) return;
            modifyBlock({
                ...currentBlock,
                data: {
                    ...currentBlock.data,
                    indentation: currentBlock.data.indentation + 1,
                },
            });
        },
    },
    {
        name: "Decrease Indentation",
        shortcut: "Tab+Shift",
        action: ({ currentBlock }, { modifyBlock }) => {
            let currentIndentation = currentBlock.data.indentation;
            if (currentIndentation <= 1) return;
            modifyBlock({
                ...currentBlock,
                data: {
                    ...currentBlock.data,
                    indentation: currentBlock.data.indentation - 1,
                },
            });
        },
    },
];
UnorderedListBlock.followingBlock = "unordered-list";

export default UnorderedListBlock;
