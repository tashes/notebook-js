import type {
  ReactElement,
  ReactNode,
  ComponentType,
  CSSProperties,
  RefAttributes,
} from "react";

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
  /**
   * Execute a menu item action.
   * @param context - Context containing the current block, notebook state, and available tools.
   * @param actions - Helper functions to modify blocks, focus blocks, or open editors.
   */
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
    callbacks: { modifyBlock: (b: BlockRaw) => void },
  ) => void;
  onDeleteBlock?: (
    args: { currentBlock: BlockRaw; state: BlockRaw[] },
    callbacks: { modifyBlock: (b: BlockRaw) => void },
  ) => void;
  onBaseTextUpdate?: (
    args: { currentBlock: BlockRaw; state: BlockRaw[] },
    callbacks: { modifyBlock: (b: BlockRaw) => void },
  ) => void;
  onMoveBlock?: (
    args: { currentBlock: BlockRaw; state: BlockRaw[] },
    callbacks: { modifyBlock: (b: BlockRaw) => void },
  ) => void;
  onConvertBlockType?: (
    args: { currentBlock: BlockRaw; state: BlockRaw[]; action?: unknown },
    callbacks: { modifyBlock: (b: BlockRaw) => void },
  ) => void;
  onModifyRawBlock?: (
    args: { currentBlock: BlockRaw; state: BlockRaw[] },
    callbacks: { modifyBlock: (b: BlockRaw) => void },
  ) => void;
  onMenuItem?: (
    args: { action: { name: string; shortcut?: string }; currentBlock: BlockRaw; state: BlockRaw[] },
    callbacks: { modifyBlock: (b: BlockRaw) => void },
  ) => void;
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

/** Primary Notebook component */
export const NotebookJS: ComponentType<NotebookJSProps>;

// Blocks
export const ParagraphBlock: BlockComponent<import('./src/components/notebookjs/types').ParagraphBlockData>;
export const HeadingBlock: BlockComponent<import('./src/components/notebookjs/types').HeadingBlockData>;
export const SubheadingBlock: BlockComponent<import('./src/components/notebookjs/types').SubheadingBlockData>;
export const OrderedListBlock: BlockComponent<import('./src/components/notebookjs/types').OrderedListBlockData>;
export const UnorderedListBlock: BlockComponent<import('./src/components/notebookjs/types').UnorderedListBlockData>;
export const ImageBlock: BlockComponent<import('./src/components/notebookjs/types').ImageBlockData>;
export const CanvasBlock: BlockComponent<import('./src/components/notebookjs/types').CanvasBlockData>;
export const TableBlock: BlockComponent<import('./src/components/notebookjs/types').TableBlockData>;
export const LatexBlock: BlockComponent<import('./src/components/notebookjs/types').LatexBlockData>;

// Tools
export const BoldTool: ToolConfig;
export const ItalicTool: ToolConfig;
export const UnderlineTool: ToolConfig;
export const SuperscriptTool: ToolConfig;
export const SubscriptTool: ToolConfig;
export const HighlightTool: ToolConfig;
export const LinkTool: ToolConfig;

// Menu Items
export const EditPropsMenuItem: MenuItemConfig;

// Editors
export const EditPropsEditor: EditorComponent<import('./src/components/notebookjs/types').PropertiesEditorData>;
export const SetNumberingEditor: EditorComponent<import('./src/components/notebookjs/types').SetNumberingEditorData>;
export const ImageEditor: EditorComponent<import('./src/components/notebookjs/types').ImageEditorData>;
export const CanvasEditor: EditorComponent<import('./src/components/notebookjs/types').CanvasEditorData>;
export const TableEditor: EditorComponent<import('./src/components/notebookjs/types').TableEditorData>;
export const LatexEditor: EditorComponent<import('./src/components/notebookjs/types').LatexEditorData>;

// Block data shapes
// Block data shapes
export type { ParagraphBlockData, HeadingBlockData, SubheadingBlockData, UnorderedListBlockData, OrderedListBlockData, LatexBlockData, LatexVariable, CanvasBlockData, ImageBlockData, TableBlockData, TableCellData } from './src/components/notebookjs/types';

// Editor data shapes
// Editor data shapes
export type { PropertiesEditorData, ImageEditorData, CanvasEditorData, LatexEditorData, SetNumberingEditorData, TableEditorData } from './src/components/notebookjs/types';
