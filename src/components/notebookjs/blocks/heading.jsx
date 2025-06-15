import React from "react";
import BaseTextEditor from "../components/base-text-editor";
import { createRef } from "react";
import { forwardRef } from "react";

const HeadingBlock = forwardRef(function (
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
    return (
        <div className="flex-grow mx-2 cursor-text relative py-0.5">
            <div className="text-2xl font-bold">
                <BaseTextEditor
                    id={id}
                    iText={data.text || ""}
                    iInlineStyles={data.inlineStyles || []}
                    blockType={HeadingBlock}
                    placeholder="Type heading text..."
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

HeadingBlock.label = "Heading";
HeadingBlock.icon = "H";
HeadingBlock.type = "heading";
HeadingBlock.shortcut = "Cmd+H";
HeadingBlock.init = () => ({
    text: "",
    inlineStyles: [],
});
HeadingBlock.menuItems = [];
HeadingBlock.followingBlock = "paragraph";

export default HeadingBlock;
