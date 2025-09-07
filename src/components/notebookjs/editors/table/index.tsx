import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Grid2X2, Table2, TableCellsMerge, TableCellsSplit, X } from "lucide-react";
import BasicTextEditor from "../../components/basic-text-editor";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import Icon from "../../ui/icon";
import { Dialog, DialogContent } from "../../ui/dialog";

type Props = { data?: any; currentBlock?: any; modifyBlock?: (b: any) => void; close?: () => void };

export default function TableEditor({ data = {}, currentBlock = {}, modifyBlock = () => {}, close = () => {} }: Props) {
  function generateRowId() { return `${Date.now()}-${Math.random()}`; }
  function generateCellId() { return `${Date.now()}-${Math.random()}`; }

  const [tableData, setTableData] = useState(() => {
    const rows = currentBlock.data.rows || [];
    return rows.map((row: any[]) => ({ id: generateRowId(), cells: row.map((cell) => ({ id: generateCellId(), ...cell })) }));
  });
  const [selectedCols, setSelectedCols] = useState<number[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [records, setRecords] = useState<{ recording: boolean; start: [number, number] }>({ recording: false, start: [0, 0] });

  const calculateColLetter = (colIndex: number) => {
    const result: string[] = []; let n = colIndex;
    while (true) { const remainder = n % 26; result.push(String.fromCharCode(65 + remainder)); n = Math.floor(n / 26); if (n === 0) break; n -= 1; }
    return result.reverse().join("");
  };
  function getRectangleCells(startRow: number, startCol: number, endRow: number, endCol: number) {
    const cols = new Set<number>(); const rows = new Set<number>();
    const rowMin = Math.min(startRow, endRow); const rowMax = Math.max(startRow, endRow);
    const colMin = Math.min(startCol, endCol); const colMax = Math.max(startCol, endCol);
    for (let row = rowMin; row <= rowMax; row++) { for (let col = colMin; col <= colMax; col++) { cols.add(col); } rows.add(row); }
    return { rows: Array.from(rows.values()), cols: Array.from(cols.values()) };
  }
  const handleIsEmpty = () => {
    const blankCell = { id: generateCellId(), content: "", inlineStyles: [], hidden: false, rowspan: 1, colspan: 1, isHeader: false, groupId: "", borders: true };
    setTableData([{ id: generateRowId(), cells: [blankCell] }]); setSelectedRows([]); setSelectedCols([]);
  };
  const handleClose = () => { modifyBlock({ ...currentBlock, data: { ...currentBlock.data, rows: tableData.map((row: any) => row.cells) } }); close(); };
  const handleAddRow = () => {
    const nCols = tableData[0].cells.length;
    const rows = selectedRows.length > 0 ? [...selectedRows].sort((a, b) => a - b) : [tableData.length - 1];
    const last = rows[rows.length - 1];
    const newRows = rows.map(() => {
      const cells = Array.from({ length: nCols }, () => ({ id: generateCellId(), content: "", inlineStyles: [], hidden: false, rowspan: 1, colspan: 1, isHeader: false, groupId: "", borders: true }));
      return { id: generateRowId(), cells };
    });
    const newTableData = [...tableData.slice(0, last + 1), ...newRows, ...tableData.slice(last + 1)];
    setTableData(newTableData);
  };
  const handleRemoveRow = () => {
    const rowsToRemove = selectedRows.length > 0 ? [...selectedRows].sort((a, b) => b - a) : [tableData.length - 1];
    const newTableData = tableData.filter((_: any, idx: number) => !rowsToRemove.includes(idx));
    if (newTableData.length === 0 || newTableData[0].cells.length === 0) handleIsEmpty(); else setTableData(newTableData);
    setSelectedRows([]);
  };
  const handleAddCol = () => {
    const cols = selectedCols.length > 0 ? [...selectedCols].sort((a, b) => a - b) : [tableData[0].cells.length - 1];
    const newTableData = tableData.map((row: any) => {
      let cellsAcc = row.cells;
      cols.forEach((colIndex, offset) => {
        const insertPos = colIndex + 1 + offset;
        const newCell = { id: generateCellId(), content: "", inlineStyles: [], hidden: false, rowspan: 1, colspan: 1, isHeader: false, groupId: "", borders: true };
        cellsAcc = [...cellsAcc.slice(0, insertPos), newCell, ...cellsAcc.slice(insertPos)];
      });
      return { id: row.id, cells: cellsAcc };
    });
    setTableData(newTableData);
  };
  const handleRemoveColumn = () => {
    const colsToRemove = selectedCols.length > 0 ? [...selectedCols].sort((a, b) => b - a) : [tableData[0].cells.length - 1];
    const newTableData = tableData.map((row: any) => ({ id: row.id, cells: row.cells.filter((_: any, idx: number) => !colsToRemove.includes(idx)) }));
    if (newTableData.length === 0 || newTableData[0].cells.length === 0) handleIsEmpty(); else setTableData(newTableData);
    setSelectedCols([]);
  };
  const handleGroupCells = () => {
    if (selectedRows.length === 0 && selectedCols.length === 0) return;
    else if (selectedRows.length > 0 && selectedCols.length === 0) {
      setTableData(tableData.map((row: any, rowIndex: number) => ({ id: row.id, cells: row.cells.map((cell: any) => (selectedRows.includes(rowIndex) ? { ...cell, borders: false } : cell)) })));
    } else if (selectedRows.length === 0 && selectedCols.length > 0) {
      setTableData(tableData.map((row: any) => ({ id: row.id, cells: row.cells.map((cell: any, colIndex: number) => (selectedCols.includes(colIndex) ? { ...cell, borders: false } : cell)) })));
    } else {
      setTableData(tableData.map((row: any, rowIndex: number) => ({ id: row.id, cells: row.cells.map((cell: any, colIndex: number) => (selectedRows.includes(rowIndex) && selectedCols.includes(colIndex) ? { ...cell, borders: false } : cell)) })));
    }
  };
  const handleUngroupCells = () => {
    if (selectedRows.length === 0 && selectedCols.length === 0) return;
    else if (selectedRows.length > 0 && selectedCols.length === 0) {
      setTableData(tableData.map((row: any, rowIndex: number) => ({ id: row.id, cells: row.cells.map((cell: any) => (selectedRows.includes(rowIndex) ? { ...cell, borders: true } : cell)) })));
    } else if (selectedRows.length === 0 && selectedCols.length > 0) {
      setTableData(tableData.map((row: any) => ({ id: row.id, cells: row.cells.map((cell: any, colIndex: number) => (selectedCols.includes(colIndex) ? { ...cell, borders: true } : cell)) })));
    } else {
      setTableData(tableData.map((row: any, rowIndex: number) => ({ id: row.id, cells: row.cells.map((cell: any, colIndex: number) => (selectedRows.includes(rowIndex) && selectedCols.includes(colIndex) ? { ...cell, borders: true } : cell)) })));
    }
  };
  const handleMergeCells = () => {
    if (selectedRows.length === 0 || selectedCols.length === 0) return;
    const minR = Math.min(...selectedRows); const maxR = Math.max(...selectedRows); const minC = Math.min(...selectedCols); const maxC = Math.max(...selectedCols);
    setTableData(tableData.map((row: any, ri: number) => ({ id: row.id, cells: row.cells.map((cell: any, ci: number) => {
      if (ri >= minR && ri <= maxR && ci >= minC && ci <= maxC) {
        if (ri === minR && ci === minC) return { ...cell, hidden: false, rowspan: maxR - minR + 1, colspan: maxC - minC + 1 };
        return { ...cell, hidden: true };
      }
      return cell;
    }) })));
    setSelectedRows([]); setSelectedCols([]);
  };
  const handleUnmergeCells = () => {
    setTableData(tableData.map((row: any) => ({ id: row.id, cells: row.cells.map((cell: any) => ({ ...cell, hidden: false, rowspan: 1, colspan: 1 })) })));
  };
  const handleSelectionAll = () => { const rowCount = tableData.length; const colCount = tableData[0].cells.length; setSelectedRows(Array.from({ length: rowCount }, (_, i) => i)); setSelectedCols(Array.from({ length: colCount }, (_, i) => i)); };
  const handleSelectionCol = (...colIndex: number[]) => { setSelectedCols([...colIndex]); setSelectedRows([]); };
  const handleSelectionRow = (...rowIndex: number[]) => { setSelectedRows([...rowIndex]); setSelectedCols([]); };
  const handleSelectionSingleCell = (rowIndex: number, colIndex: number) => { setSelectedCols([colIndex]); setSelectedRows([rowIndex]); };
  const handleCellContentChange = ({ text, inlineStyles }: any, rowIndex: number, colIndex: number) => {
    const newTableData = [
      ...tableData.slice(0, rowIndex),
      { id: tableData[rowIndex].id, cells: [ ...tableData[rowIndex].cells.slice(0, colIndex), { ...tableData[rowIndex].cells[colIndex], content: text, inlineStyles }, ...tableData[rowIndex].cells.slice(colIndex + 1) ] },
      ...tableData.slice(rowIndex + 1),
    ];
    setTableData(newTableData);
  };
  const handleCellMouseDown = (e: React.MouseEvent, r: number, c: number) => { setRecords({ ...records, recording: true, start: [r, c] }); };
  const handleCellMouseUp = (e: React.MouseEvent, r: number, c: number) => { const start = records.start; const end: [number, number] = [r, c]; const selection = getRectangleCells(...start, ...end); setSelectedRows(selection.rows); setSelectedCols(selection.cols); setRecords({ ...records, recording: false, start: [0, 0] }); };

  return (
    <div className="flex flex-col justify-start fixed top-0 left-0 p-4 h-full w-full max-w-screen overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-card text-foreground rounded-lg w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer mr-4"><Table2 className="w-5 h-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleAddRow()}><Icon icon="AddRow" className="w-5 h-5" /><span>Add Row</span></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddCol()}><Icon icon="AddColumn" className="w-5 h-5" /><span>Add Column</span></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleRemoveRow()}><Icon icon="DeleteRow" className="w-5 h-5" /><span>Delete Row</span></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleRemoveColumn()}><Icon icon="DeleteColumn" className="w-5 h-5" /><span>Delete Column</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer"><Grid2X2 className="w-5 h-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleGroupCells()}><Icon icon="GroupCells" className="w-5 h-5" /><span>Group Cells</span></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleUngroupCells()}><Icon icon="UngroupCells" className="w-5 h-5" /><span>Ungroup Cells</span></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleMergeCells()}><TableCellsMerge className="w-5 h-5" /><span>Merge Cells</span></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleUnmergeCells()}><TableCellsSplit className="w-5 h-5" /><span>Split Cells</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex-grow"></div>
        <Button variant="ghost" size="icon" className="cursor-pointer" onClick={handleClose}><X className="w-5 h-5" /></Button>
      </div>
      <div className="flex-grow overflow-auto p-4">
        <div className="border border-border rounded-md overflow-hidden bg-card text-foreground">
          <div className="overflow-x-auto relative">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="w-10 h-10 bg-muted border border-border cursor-pointer hover:bg-accent sticky left-0 z-10" onClick={() => handleSelectionAll()}></th>
                  {tableData[0].cells.map((cell: any, colIndex: number) => (
                    <th key={cell.id} className={`px-3 py-2 border border-border font-semibold text-center cursor-pointer hover:bg-accent ${selectedCols.includes(colIndex) ? "bg-accent" : "bg-muted"}`} onClick={() => handleSelectionCol(colIndex)}>
                      {calculateColLetter(colIndex)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row: any, rowIndex: number) => (
                  <tr key={`row-${row.id}`}>
                    <th className={`px-3 py-2 border border-border font-semibold text-center cursor-pointer hover:bg-accent ${selectedRows.includes(rowIndex) ? "bg-accent" : "bg-muted"}`} onClick={() => handleSelectionRow(rowIndex)}>
                      {rowIndex + 1}
                    </th>
                    {row.cells.map((cell: any, colIndex: number) => (
                      <td key={cell.id} className={`relative p-0 border border-border ${selectedRows.includes(rowIndex) || selectedCols.includes(colIndex) ? "bg-accent" : ""}`} rowSpan={cell.hidden ? 1 : cell.rowspan} colSpan={cell.hidden ? 1 : cell.colspan} onMouseDown={(e) => handleCellMouseDown(e, rowIndex, colIndex)} onMouseUp={(e) => handleCellMouseUp(e, rowIndex, colIndex)}>
                        {!cell.hidden && (
                          <div className={`relative ${cell.borders ? "border" : ""}`}>
                            <BasicTextEditor text={cell.content} inlineStyles={cell.inlineStyles} tools={data.tools || []} readOnly={false} placeholder="Cell content" onChange={({ text, inlineStyles }) => handleCellContentChange({ text, inlineStyles }, rowIndex, colIndex)} />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

(TableEditor as any).label = "table";

