import type { ToolConfig } from "../../../../../index";
import type { TableCellData } from "../../blocks/table.types";

export interface TableEditorData {
  tools: ToolConfig[];
  calculateBorders: (
    borders: boolean,
    rowIndex: number,
    colIndex: number,
    rows: TableCellData[][],
  ) => string;
}
