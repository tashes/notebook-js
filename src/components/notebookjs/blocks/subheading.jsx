import React, { forwardRef } from "react";
import BaseTextEditor from "../components/base-text-editor";

const SubheadingBlock = forwardRef(function (
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
            <div className="text-xl font-semibold text-gray-700">
                <BaseTextEditor
                    id={id}
                    iText={data.text || ""}
                    iInlineStyles={data.inlineStyles || []}
                    blockType={SubheadingBlock}
                    placeholder="Type subheading text...."
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

SubheadingBlock.label = "Subheading";
SubheadingBlock.icon = "S";
SubheadingBlock.type = "subheading";
SubheadingBlock.shortcut = "Cmd+S";
SubheadingBlock.init = () => ({
    text: "",
    inlineStyles: [],
});
SubheadingBlock.menuItems = [];
SubheadingBlock.followingBlock = "paragraph";

export default SubheadingBlock;
