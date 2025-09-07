import React, { forwardRef } from "react";
import BaseTextEditor from "../components/base-text-editor";

const ParagraphBlock = forwardRef<any, any>(function (
  { id = "", readOnly = false, data = {}, props = {}, tools = [], references = { search: () => {}, open: () => {} }, shortcuts = [], dispatcher = () => {} },
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
        references={references}
        readOnly={readOnly}
        shortcuts={shortcuts}
        props={props}
        ref={ref}
      />
    </div>
  );
});

(ParagraphBlock as any).label = "Paragraph";
(ParagraphBlock as any).icon = "P";
(ParagraphBlock as any).type = "paragraph";
(ParagraphBlock as any).shortcut = "Cmd+P";
(ParagraphBlock as any).init = () => ({ text: "", inlineStyles: [] });
(ParagraphBlock as any).menuItems = [];
(ParagraphBlock as any).followingBlock = "paragraph";

export default ParagraphBlock as any;
