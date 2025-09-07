import React, { forwardRef } from "react";
import BaseTextEditor from "../components/base-text-editor";

const HeadingBlock = forwardRef<any, any>(function (
    {
        id = "",
        readOnly = false,
        data = {},
        props = {},
        tools = [],
        references = { search: () => {}, open: () => {} },
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

(HeadingBlock as any).label = "Heading";
(HeadingBlock as any).icon = "H";
(HeadingBlock as any).type = "heading";
(HeadingBlock as any).shortcut = "Cmd+H";
(HeadingBlock as any).init = () => ({ text: "", inlineStyles: [] });
(HeadingBlock as any).menuItems = [];
(HeadingBlock as any).followingBlock = "paragraph";

export default HeadingBlock as any;
