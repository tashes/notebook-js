import React, { forwardRef } from "react";
import BaseTextEditor from "../components/base-text-editor";

const BULLET_CHARACTERS = ["•", "◦", "⦿", "⦾", "⁃", "‣"];
const MAX_INDENT = 6;

const UnorderedListBlock = forwardRef<any, any>(function (
  { id = "", readOnly = false, data = {}, props = {}, tools = [], references = { search: () => {}, open: () => {} }, shortcuts = [], dispatcher = () => {} },
  ref,
) {
  const indentation = Math.max(1, (data as any).indentation || 1);
  const bulletIndex = (indentation - 1) % BULLET_CHARACTERS.length;
  const bulletCharacter = BULLET_CHARACTERS[bulletIndex];
  return (
    <div className="flex flex-grow mx-2 cursor-text relative py-0">
      <div className={`flex-shrink-0 text-right flex items-baseline justify-end mr-2 select-none`} style={{ marginLeft: `${indentation * 0.5}rem` }}>
        <span className="text-muted-foreground font-mono h-8 flex items-center justify-center">{bulletCharacter}</span>
      </div>
      <div className="relative flex-1">
        <BaseTextEditor
          id={id}
          iText={(data as any).text || ""}
          iInlineStyles={(data as any).inlineStyles || []}
          blockType={UnorderedListBlock}
          placeholder="Type unordered list text...."
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

(UnorderedListBlock as any).label = "Unordered List";
(UnorderedListBlock as any).icon = "UL";
(UnorderedListBlock as any).type = "unordered-list";
(UnorderedListBlock as any).shortcut = "Cmd+U";
(UnorderedListBlock as any).init = (prevBlock: any) => {
  let indentation = 1;
  if (prevBlock?.type === "unordered-list") indentation = prevBlock?.data.indentation;
  return { text: "", inlineStyles: [], indentation };
};
(UnorderedListBlock as any).menuItems = [
  { name: "Increase Indentation", shortcut: "Tab", action: ({ currentBlock }: any, { modifyBlock }: any) => {
      const currentIndentation = currentBlock.data.indentation;
      if (currentIndentation >= MAX_INDENT) return;
      modifyBlock({ ...currentBlock, data: { ...currentBlock.data, indentation: currentBlock.data.indentation + 1 } });
    },
  },
  { name: "Decrease Indentation", shortcut: "Tab+Shift", action: ({ currentBlock }: any, { modifyBlock }: any) => {
      const currentIndentation = currentBlock.data.indentation;
      if (currentIndentation <= 1) return;
      modifyBlock({ ...currentBlock, data: { ...currentBlock.data, indentation: currentBlock.data.indentation - 1 } });
    },
  },
];
(UnorderedListBlock as any).followingBlock = "unordered-list";

export default UnorderedListBlock as any;
