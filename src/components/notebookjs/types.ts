import type { CSSProperties, ReactElement, ReactNode, RefAttributes, ComponentType } from "react";

export type BlockId = string;
export type BlockTypeId = string;

export type BlockRaw<D = any, P extends Record<string, string> = Record<string, string>> = {
  id: BlockId;
  blockid: string;
  type: BlockTypeId;
  data: D;
  props: P;
};

export interface Shortcut {
  shortcut: string;
  action: (params: {
    id: BlockId;
    blockType?: BlockTypeId | undefined;
    dispatcher: (action: unknown) => void;
  }) => void;
}

export interface MenuItemConfig {
  name: string;
  shortcut?: string;
  action: (
    context: {
      currentBlock: BlockRaw;
      state: BlockRaw[];
      tools: ToolConfig[];
    },
    actions: {
      modifyBlock: (newBlock: BlockRaw) => void;
      focusOnCurrentBlock: () => void;
      openEditor: (name: string, data: unknown) => void;
    },
  ) => void | Promise<unknown>;
}

export interface ToolConfig {
  styles: Array<{ name: string; styles: CSSProperties }>;
  constants: string[];
  label: string;
  icon: ReactNode;
  component?: ComponentType<any>;
  data?: (
    selectedText: string,
    references: { search: (q: string) => unknown; open: (ref: unknown) => unknown },
  ) => unknown;
}

export interface BlockProps<
  D = unknown,
  P extends Record<string, string> = Record<string, string>,
> {
  id: BlockId;
  blockid?: string;
  block?: BlockRaw;
  readOnly: boolean;
  data: D;
  props: P;
  tools: ToolConfig[];
  references: { search: (query: string) => unknown; open: (ref: unknown) => unknown };
  shortcuts: Shortcut[];
  dispatcher: (action: unknown) => void;
  openEditor?: (name: string, data: unknown) => void;
}

export interface BlockComponent<
  D = unknown,
  P extends Record<string, string> = Record<string, string>,
> {
  (props: BlockProps<D, P> & RefAttributes<any>): ReactElement | null;
  label: string;
  icon: ReactNode;
  type: BlockTypeId;
  shortcut?: string;
  init: (prevBlock?: BlockRaw) => D;
  menuItems?: MenuItemConfig[];
  followingBlock?: BlockTypeId;
  onCreateNewBlock?: (
    args: { currentBlock: BlockRaw; state: BlockRaw[] },
    callbacks: { modifyBlock: (b: BlockRaw) => void; focusOnCurrentBlock?: () => void },
  ) => void | Promise<void>;
  onDeleteBlock?: (
    args: { currentBlock: BlockRaw; state: BlockRaw[] },
    callbacks: { modifyBlock: (b: BlockRaw) => void; focusOnCurrentBlock?: () => void },
  ) => void | Promise<void>;
  onBaseTextUpdate?: (
    args: { currentBlock: BlockRaw; state: BlockRaw[] },
    callbacks: { modifyBlock: (b: BlockRaw) => void; focusOnCurrentBlock?: () => void },
  ) => void | Promise<void>;
  onMoveBlock?: (
    args: { currentBlock: BlockRaw; state: BlockRaw[] },
    callbacks: { modifyBlock: (b: BlockRaw) => void; focusOnCurrentBlock?: () => void },
  ) => void | Promise<void>;
  onConvertBlockType?: (
    args: { currentBlock: BlockRaw; state: BlockRaw[]; action?: unknown },
    callbacks: { modifyBlock: (b: BlockRaw) => void; focusOnCurrentBlock?: () => void },
  ) => void | Promise<void>;
  onModifyRawBlock?: (
    args: { currentBlock: BlockRaw; state: BlockRaw[] },
    callbacks: { modifyBlock: (b: BlockRaw) => void; focusOnCurrentBlock?: () => void },
  ) => void | Promise<void>;
  onMenuItem?: (
    args: { action: { name: string; shortcut?: string }; currentBlock: BlockRaw; state: BlockRaw[] },
    callbacks: { modifyBlock: (b: BlockRaw) => void; focusOnCurrentBlock?: () => void },
  ) => void | Promise<void>;
}

export interface EditorProps<D = unknown> {
  data: D;
  currentBlock: BlockRaw;
  modifyBlock: (block: BlockRaw) => void;
  close: () => void;
}

export interface EditorComponent<D = unknown> {
  (props: EditorProps<D>): ReactElement | null;
  label: string;
}

export interface NotebookJSProps {
  readOnly?: boolean;
  blocks?: BlockRaw[]; // Controlled blocks data
  onChange?: (blocks: BlockRaw[]) => void; // Fired on block change
  blockTypes?: BlockComponent[]; // List of available block types
  tools?: ToolConfig[];
  editors?: EditorComponent[];
  menuItems?: MenuItemConfig[];
  initProps?: () => Record<string, string>;
  openReference?: (...args: any[]) => any;
  searchReferences?: (...args: any[]) => any;
}

// Block data shapes
export interface ParagraphBlockData { text: string; inlineStyles: any[] }
export interface HeadingBlockData { text: string; inlineStyles: any[] }
export interface SubheadingBlockData { text: string; inlineStyles: any[] }
export interface OrderedListBlockData { text: string; inlineStyles: any[]; indentation: number; numbering: number[]; manual: boolean }
export interface UnorderedListBlockData { text: string; inlineStyles: any[]; indentation: number }
export interface ImageBlockData { text: string; inlineStyles: any[]; img: string }
export interface LatexVariable { name: string; description: string }
export interface LatexBlockData { text: string; inlineStyles: any[]; latex: string; variables: LatexVariable[] }
export interface CanvasBlockData { text: string; inlineStyles: any[]; elements: any[] | null; files: Record<string, any> }
export interface TableCellData {
  content: string; inlineStyles: any[]; hidden: boolean; rowspan: number; colspan: number; isHeader: boolean; groupId: string; borders: boolean
}
export interface TableBlockData { text: string; inlineStyles: any[]; rows: TableCellData[][] }

// Editor data shapes
export interface PropertiesEditorData {}
export interface SetNumberingEditorData {}
export interface ImageEditorData { handleSelectImg: () => void }
export interface CanvasEditorData {}
export interface TableEditorData { tools: ToolConfig[]; calculateBorders?: (...args: any[]) => string }
export interface LatexEditorData {}
