import type { ReactElement, ReactNode, ComponentType, CSSProperties, RefAttributes } from 'react';

export interface Shortcut {
  shortcut: string;
  action: (params: { id: string; blockType?: any; dispatcher: (action: any) => void }) => void;
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
      currentBlock: any;
      state: any[];
      tools: ToolConfig[];
    },
    actions: {
      modifyBlock: (newBlock: any) => void;
      focusOnCurrentBlock: () => void;
      openEditor: (name: string, data: any) => void;
    }
  ) => void | Promise<any>;
}

export interface ToolConfig {
  styles: Array<{ name: string; styles: CSSProperties }>;
  constants: string[];
  label: string;
  icon: ReactNode;
  component?: ComponentType<any>;
  data?: (selectedText: string, references: { search: any; open: any }) => any;
}

export interface BlockProps<T = any> {
  id: string;
  readOnly: boolean;
  data: T;
  props: Record<string, any>;
  tools: ToolConfig[];
  references: { search: (query: string) => void; open: (ref: any) => void };
  shortcuts: Shortcut[];
  dispatcher: (action: any) => void;
}

export interface BlockComponent<T = any> {
  (props: BlockProps<T> & RefAttributes<any>): ReactElement | null;
  label: string;
  icon: ReactNode;
  type: string;
  shortcut?: string;
  init: (prevBlock?: any) => T;
  menuItems?: MenuItemConfig[];
  followingBlock?: string;
  onCreateNewBlock?: (args: any, callbacks: any) => void;
  onDeleteBlock?: (args: any, callbacks: any) => void;
  onBaseTextUpdate?: (args: any, callbacks: any) => void;
  onMoveBlock?: (args: any, callbacks: any) => void;
  onConvertBlockType?: (args: any, callbacks: any) => void;
}

export interface EditorProps<T = any> {
  data: T;
  currentBlock: any;
  modifyBlock: (block: any) => void;
  close: () => void;
}

export interface EditorComponent {
  (props: EditorProps<any>): ReactElement | null;
  label: string;
}

export interface NotebookJSProps {
  readOnly?: boolean;
  initialBlocks?: any[];
  onChange?: (blocks: any[]) => void;
  blocks?: BlockComponent[];
  tools?: ToolConfig[];
  editors?: EditorComponent[];
  menuItems?: MenuItemConfig[];
  initProps?: () => Record<string, any>;
  openReference?: (...args: any[]) => any;
  searchReferences?: (...args: any[]) => any;
}

/** Primary Notebook component */
export const NotebookJS: ComponentType<NotebookJSProps>;

// Blocks
export const ParagraphBlock: BlockComponent;
export const HeadingBlock: BlockComponent;
export const SubheadingBlock: BlockComponent;
export const OrderedListBlock: BlockComponent;
export const UnorderedListBlock: BlockComponent;
export const ImageBlock: BlockComponent;
export const CanvasBlock: BlockComponent;
export const TableBlock: BlockComponent;
export const LatexBlock: BlockComponent;

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
export const EditPropsEditor: EditorComponent;
export const SetNumberingEditor: EditorComponent;
export const ImageEditor: EditorComponent;
export const CanvasEditor: EditorComponent;
export const TableEditor: EditorComponent;
export const LatexEditor: EditorComponent;
