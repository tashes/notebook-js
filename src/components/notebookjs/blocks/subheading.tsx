import React, { forwardRef } from "react";
import BaseTextEditor from "../components/base-text-editor";

const SubheadingBlock = forwardRef<any, any>(function (
  { id = "", readOnly = false, data = {}, props = {}, tools = [], references = { search: () => {}, open: () => {} }, shortcuts = [], dispatcher = () => {} },
  ref,
) {
  return (
    <div className="flex-grow mx-2 cursor-text relative py-0.5">
      <div className="text-xl font-semibold text-foreground">
        <BaseTextEditor
          id={id}
          iText={data.text || ""}
          iInlineStyles={data.inlineStyles || []}
          blockType={SubheadingBlock}
          placeholder="Type subheading text...."
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

(SubheadingBlock as any).label = "Subheading";
(SubheadingBlock as any).icon = "S";
(SubheadingBlock as any).type = "subheading";
(SubheadingBlock as any).shortcut = "Cmd+S";
(SubheadingBlock as any).init = () => ({ text: "", inlineStyles: [] });
(SubheadingBlock as any).menuItems = [];
(SubheadingBlock as any).followingBlock = "paragraph";

export default SubheadingBlock as any;
