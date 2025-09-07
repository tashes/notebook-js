// Lightweight typed harness for reducer behavior.
// This file is not wired to a runner but compiles under strict TS to validate types.

import { reducer } from "../components/notebookjs/utils/reducer";
import { Block } from "../components/notebookjs/data/block";
import type { BlockComponent, ParagraphBlockData, BlockRaw, ToolConfig, MenuItemConfig, EditorComponent } from "../components/notebookjs/types";

// Minimal Paragraph block for testing
const TestParagraph: BlockComponent<ParagraphBlockData> = Object.assign(
  () => null,
  {
    label: "Paragraph",
    icon: "P",
    type: "paragraph",
    shortcut: "Cmd+P",
    init: () => ({ text: "", inlineStyles: [] }),
    menuItems: [] as MenuItemConfig[],
    followingBlock: "paragraph",
  },
);

async function main() {
  const blocks = [TestParagraph] as BlockComponent[];
  const tools: ToolConfig[] = [];
  const editors: EditorComponent[] = [];
  const menuItems: MenuItemConfig[] = [];
  const refsMap = new Map<string, React.RefObject<any>>();

  // Initial state contains one paragraph block
  const initialRaw: BlockRaw<ParagraphBlockData> = {
    id: "00112233445566778899aabb",
    blockid: "abcdEF_0123",
    type: "paragraph",
    data: { text: "Hello", inlineStyles: [] },
    props: {},
  };
  const state = [new Block<ParagraphBlockData>(initialRaw)];

  const next = await reducer({
    state,
    action: { type: "base-text-update", id: initialRaw.id, text: "Hello world", inlineStyles: [] },
    refsMap,
    blocks,
    tools,
    editors,
    menuItems,
    initProps: () => ({}),
    addCallback: () => {},
    editorFns: {},
    dispatcher: () => {},
  });

  // Type guards
  const outBlock = next[0].toObj();
  const text: string = (outBlock.data as ParagraphBlockData).text;
  console.log("Updated text:", text);
}

// Intentionally not invoking main here to avoid side effects when imported.
// Consumers can run main() in a runner environment.
export { main };

