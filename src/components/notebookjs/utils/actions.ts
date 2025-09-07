import type { BlockRaw, BlockComponent, ToolConfig, MenuItemConfig, EditorComponent } from "../types";

export type BlockMoveDirection = "up" | "down";
export type FocusMoveDirection = "up" | "down";

export type Action =
  | { type: "block-type-conversion"; id: string; oldBlockType: string; newBlockType: string }
  | { type: "menu-execution"; id: string; name: string; action: Function }
  | { type: "base-text-update"; id: string; text: string; inlineStyles: any[] }
  | { type: "block-delete"; id: string }
  | { type: "block-move"; id: string; dir: BlockMoveDirection }
  | { type: "focus-move"; id: string; dir: FocusMoveDirection }
  | { type: "create-new-block"; id?: string; position: "before" | "after"; blockType: string }
  | { type: "modify-raw-block"; block: BlockRaw };

export type Callback = (ctx: { refsMap: Map<string, React.RefObject<any>> }) => void;

export type ReducerEnv = {
  state: import("../data/block").Block[];
  action: Action;
  refsMap: Map<string, React.RefObject<any>>;
  blocks: BlockComponent[];
  tools: ToolConfig[];
  editors: EditorComponent[];
  menuItems: MenuItemConfig[];
  openReference?: Function;
  searchReferences?: Function;
  initProps: () => Record<string, string>;
  addCallback: (cb: Callback) => void;
  editorFns: any;
  dispatcher: (action: Action) => void;
};
