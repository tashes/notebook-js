export interface SetNumberingEditorData {
  calc: (numbering: number[]) => string;
  max: number;
  modifyOrderedListBlocks: () => void;
}

