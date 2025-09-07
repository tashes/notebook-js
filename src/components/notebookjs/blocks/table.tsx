import React, { forwardRef } from "react";
import { Table2 } from "lucide-react";
import BaseTextEditor from "../components/base-text-editor";
import BasicTextEditor from "../components/basic-text-editor";
import { useNotebook } from "../context";
import type { BlockComponent, BlockProps, TableBlockData, TableCellData } from "../types";

const TableBlockInner = forwardRef<any, BlockProps<TableBlockData>>(function (
  { id = "", readOnly = false, data, props, references = { search: () => {}, open: () => {} }, shortcuts = [], openEditor = () => {} },
  ref,
) {
  const { tools } = useNotebook();
  const handleEditTable = () => openEditor("table", { tools, calculateBorders });
  function calculateBorders(borders: boolean, rowIndex: number, colIndex: number, rows: TableCellData[][]) {
    const classNames: string[] = [];
    let topStrong = borders; if (rowIndex > 0 && rows[rowIndex - 1]?.[colIndex]) { const above = rows[rowIndex - 1][colIndex]; topStrong = topStrong || above.borders; }
    classNames.push(`border-t ${topStrong ? "border-t-gray-400" : "border-t-gray-100"}`);
    let bottomStrong = borders; if (rowIndex < rows.length - 1 && rows[rowIndex + 1]?.[colIndex]) { const below = rows[rowIndex + 1][colIndex]; bottomStrong = bottomStrong || below.borders; }
    classNames.push(`border-b ${bottomStrong ? "border-b-gray-400" : "border-b-gray-100"}`);
    let leftStrong = borders; if (colIndex > 0 && rows[rowIndex]?.[colIndex - 1]) { const left = rows[rowIndex][colIndex - 1]; leftStrong = leftStrong || left.borders; }
    classNames.push(`border-l ${leftStrong ? "border-l-gray-400" : "border-l-gray-100"}`);
    let rightStrong = borders; if (colIndex < rows[rowIndex].length - 1 && rows[rowIndex]?.[colIndex + 1]) { const right = rows[rowIndex][colIndex + 1]; rightStrong = rightStrong || right.borders; }
    classNames.push(`border-r ${rightStrong ? "border-r-gray-400" : "border-r-gray-100"}`);
    return classNames.join(" ");
  }
  return (
    <div className="flex-grow mx-2 overflow-hidden">
      <div className="my-2 relative overflow-auto">
        {data.rows.length > 0 ? (
          <table className="w-full border-collapse min-w-max text-muted-foreground cursor-pointer" onClick={handleEditTable}>
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <tr key={`preview-row-${rowIndex}`}>
                  {row.map((cell, colIndex) => {
                    const Ele = cell.isHeader ? "th" : "td";
                    return (
                      cell.hidden === false && (
                        <Ele key={`preview-cell-${rowIndex}-${colIndex}`} className={`text-sm p-2 min-w-[100px] min-h-[40px] ${calculateBorders(cell.borders, rowIndex, colIndex, data.rows)}`} rowSpan={cell.rowspan || 1} colSpan={cell.colspan || 1}>
                          <BasicTextEditor text={cell.content} inlineStyles={cell.inlineStyles} readOnly={true} tools={tools} placeholder="Empty" />
                        </Ele>
                      )
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="border border-dashed border-border rounded-md p-8 text-center cursor-pointer" onClick={handleEditTable}>
            <Table2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Add a table</p>
          </div>
        )}
      </div>
      <div className="cursor-pointer relative">
        <div className="text-xs text-muted-foreground">
          <BaseTextEditor id={id} iText={data.text || ""} iInlineStyles={data.inlineStyles || []} blockType={TableBlock as any} placeholder="Type table caption text..." references={references} readOnly={readOnly} shortcuts={shortcuts} props={props} ref={ref} />
        </div>
      </div>
    </div>
  );
});

export const TableBlock: BlockComponent<TableBlockData> = Object.assign(TableBlockInner, {
  label: "Table",
  icon: "T",
  type: "table",
  shortcut: "Cmd+Y",
  init: () => ({ text: "", inlineStyles: [], rows: [[{ content: "", inlineStyles: [], hidden: false, rowspan: 1, colspan: 1, isHeader: false, groupId: "", borders: true }, { content: "", inlineStyles: [], hidden: false, rowspan: 1, colspan: 1, isHeader: false, groupId: "", borders: true }], [{ content: "", inlineStyles: [], hidden: false, rowspan: 1, colspan: 1, isHeader: false, groupId: "", borders: true }, { content: "", inlineStyles: [], hidden: false, rowspan: 1, colspan: 1, isHeader: false, groupId: "", borders: true }]] }),
  menuItems: [],
  followingBlock: "paragraph",
});

export default TableBlock;

