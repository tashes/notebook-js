export interface TableCellData {
  content: string;
  inlineStyles: any[];
  hidden: boolean;
  rowspan: number;
  colspan: number;
  isHeader: boolean;
  groupId: string;
  borders: boolean;
}

export interface TableBlockData {
  text: string;
  inlineStyles: any[];
  rows: TableCellData[][];
}

