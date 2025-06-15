import React, { forwardRef } from "react";
import BaseTextEditor from "../components/base-text-editor";

// Forward ref to the inner BaseTextEditor
const ParagraphBlock = forwardRef(function (
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
            <BaseTextEditor
                id={id}
                iText={data.text || ""}
                iInlineStyles={data.inlineStyles || []}
                blockType={ParagraphBlock}
                placeholder="Type paragraph text...."
                tools={tools}
                references={references}
                readOnly={readOnly}
                shortcuts={shortcuts}
                props={props}
                dispatcher={dispatcher}
                ref={ref}
            />
        </div>
    );
});

ParagraphBlock.label = "Paragraph";
ParagraphBlock.icon = "P";
ParagraphBlock.type = "paragraph";
ParagraphBlock.shortcut = "Cmd+P";
ParagraphBlock.init = () => ({
    text: "",
    inlineStyles: [],
});
ParagraphBlock.menuItems = [];
ParagraphBlock.followingBlock = "paragraph";

export default ParagraphBlock;
