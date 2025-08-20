import React, { useState } from "react";
import { Button } from "../../ui/button";
import {
    BetweenHorizonalStart,
    BetweenVerticalStart,
    Grid2X2,
    Group,
    Table2,
    TableCellsMerge,
    TableCellsSplit,
    Ungroup,
    X,
} from "lucide-react";
import BasicTextEditor from "../../components/basic-text-editor";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import Icon from "../../ui/icon";
import { Dialog, DialogContent } from "../../ui/dialog";

export default function TableEditor({
    data = {},
    currentBlock = {},
    modifyBlock = () => {},
    close = () => {},
}) {
    function generateRowId() {
        return `${Date.now()}-${Math.random()}`;
    }

    function generateCellId() {
        return `${Date.now()}-${Math.random()}`;
    }

    let [tableData, setTableData] = useState(() => {
        const rows = currentBlock.data.rows || [];
        return rows.map((row) => ({
            id: generateRowId(),
            cells: row.map((cell) => ({ id: generateCellId(), ...cell })),
        }));
    });
    let [selectedCols, setSelectedCols] = useState([]);
    let [selectedRows, setSelectedRows] = useState([]);
    let [records, setRecords] = useState({
        recording: false,
        start: [0, 0],
    });

    let calculateColLetter = (colIndex) => {
        let result = [];
        let n = colIndex;
        while (true) {
            let remainder = n % 26;
            result.push(String.fromCharCode(65 + remainder));
            n = Math.floor(n / 26);
            if (n === 0) break;
            n -= 1;
        }
        return result.reverse().join("");
    };

    function getRectangleCells(startRow, startCol, endRow, endCol) {
        const cols = new Set();
        const rows = new Set();

        const rowMin = Math.min(startRow, endRow);
        const rowMax = Math.max(startRow, endRow);
        const colMin = Math.min(startCol, endCol);
        const colMax = Math.max(startCol, endCol);

        for (let row = rowMin; row <= rowMax; row++) {
            for (let col = colMin; col <= colMax; col++) {
                cols.add(col);
            }
            rows.add(row);
        }

        return {
            rows: Array.from(rows.values()),
            cols: Array.from(cols.values()),
        };
    }

    let handleIsEmpty = () => {
        const blankCell = {
            id: generateCellId(),
            content: "",
            inlineStyles: [],
            hidden: false,
            rowspan: 1,
            colspan: 1,
            isHeader: false,
            groupId: "",
            borders: true,
        };
        setTableData([{ id: generateRowId(), cells: [blankCell] }]);
        setSelectedRows([]);
        setSelectedCols([]);
    };

    let handleClose = () => {
        modifyBlock({
            ...currentBlock,
            data: {
                ...currentBlock.data,
                rows: tableData.map((row) => row.cells),
            },
        });
        close();
    };

    let handleAddRow = () => {
        const nCols = tableData[0].cells.length;
        const rows =
            selectedRows.length > 0
                ? [...selectedRows].sort((a, b) => a - b)
                : [tableData.length - 1];
        const last = rows[rows.length - 1];

        // build one blank row per selected row (or just one if none were selected)
        const newRows = rows.map(() => {
            const cells = [];
            for (let j = 0; j < nCols; j++) {
                cells.push({
                    id: generateCellId(),
                    content: "",
                    inlineStyles: [],
                    hidden: false,
                    rowspan: 1,
                    colspan: 1,
                    isHeader: false,
                    groupId: "",
                    borders: true,
                });
            }
            return { id: generateRowId(), cells };
        });

        const newTableData = [
            ...tableData.slice(0, last + 1),
            ...newRows,
            ...tableData.slice(last + 1),
        ];

        setTableData(newTableData);
    };

    let handleRemoveRow = () => {
        const rowsToRemove =
            selectedRows.length > 0
                ? [...selectedRows].sort((a, b) => b - a)
                : [tableData.length - 1];
        const newTableData = tableData.filter(
            (_, idx) => !rowsToRemove.includes(idx),
        );
        if (newTableData.length === 0 || newTableData[0].cells.length === 0) {
            handleIsEmpty();
        } else {
            setTableData(newTableData);
        }
        setSelectedRows([]);
    };

    let handleAddCol = () => {
        const cols =
            selectedCols.length > 0
                ? [...selectedCols].sort((a, b) => a - b)
                : [tableData[0].cells.length - 1];

        // for each row, insert new blank cells after each selected column index
        const newTableData = tableData.map((row) => {
            let cellsAcc = row.cells;
            cols.forEach((colIndex, offset) => {
                const insertPos = colIndex + 1 + offset;
                const newCell = {
                    id: generateCellId(),
                    content: "",
                    inlineStyles: [],
                    hidden: false,
                    rowspan: 1,
                    colspan: 1,
                    isHeader: false,
                    groupId: "",
                    borders: true,
                };
                cellsAcc = [
                    ...cellsAcc.slice(0, insertPos),
                    newCell,
                    ...cellsAcc.slice(insertPos),
                ];
            });
            return { id: row.id, cells: cellsAcc };
        });

        setTableData(newTableData);
    };

    let handleRemoveColumn = () => {
        const colsToRemove =
            selectedCols.length > 0
                ? [...selectedCols].sort((a, b) => b - a)
                : [tableData[0].cells.length - 1];
        const newTableData = tableData.map((row) => ({
            id: row.id,
            cells: row.cells.filter((_, idx) => !colsToRemove.includes(idx)),
        }));
        if (newTableData.length === 0 || newTableData[0].cells.length === 0) {
            handleIsEmpty();
        } else {
            setTableData(newTableData);
        }
        setSelectedCols([]);
    };

    let handleGroupCells = () => {
        if (selectedRows.length === 0 && selectedCols.length === 0) return;
        else if (selectedRows.length > 0 && selectedCols.length === 0) {
            setTableData(
                tableData.map((row, rowIndex) => ({
                    id: row.id,
                    cells: row.cells.map((cell, colIndex) =>
                        selectedRows.includes(rowIndex)
                            ? { ...cell, borders: false }
                            : cell,
                    ),
                })),
            );
        } else if (selectedRows.length === 0 && selectedCols.length > 0) {
            setTableData(
                tableData.map((row, rowIndex) => ({
                    id: row.id,
                    cells: row.cells.map((cell, colIndex) =>
                        selectedCols.includes(colIndex)
                            ? { ...cell, borders: false }
                            : cell,
                    ),
                })),
            );
        } else {
            setTableData(
                tableData.map((row, rowIndex) => ({
                    id: row.id,
                    cells: row.cells.map((cell, colIndex) =>
                        selectedRows.includes(rowIndex) &&
                        selectedCols.includes(colIndex)
                            ? { ...cell, borders: false }
                            : cell,
                    ),
                })),
            );
        }
    };

    let handleUngroupCells = () => {
        if (selectedRows.length === 0 && selectedCols.length === 0) return;
        else if (selectedRows.length > 0 && selectedCols.length === 0) {
            setTableData(
                tableData.map((row, rowIndex) => ({
                    id: row.id,
                    cells: row.cells.map((cell, colIndex) =>
                        selectedRows.includes(rowIndex)
                            ? { ...cell, borders: true }
                            : cell,
                    ),
                })),
            );
        } else if (selectedRows.length === 0 && selectedCols.length > 0) {
            setTableData(
                tableData.map((row, rowIndex) => ({
                    id: row.id,
                    cells: row.cells.map((cell, colIndex) =>
                        selectedCols.includes(colIndex)
                            ? { ...cell, borders: true }
                            : cell,
                    ),
                })),
            );
        } else {
            setTableData(
                tableData.map((row, rowIndex) => ({
                    id: row.id,
                    cells: row.cells.map((cell, colIndex) =>
                        selectedRows.includes(rowIndex) &&
                        selectedCols.includes(colIndex)
                            ? { ...cell, borders: true }
                            : cell,
                    ),
                })),
            );
        }
    };

    let handleMergeCells = () => {
        // nothing to do if no full rectangle selected
        if (selectedRows.length === 0 || selectedCols.length === 0) return;

        // compute bounds
        const minR = Math.min(...selectedRows);
        const maxR = Math.max(...selectedRows);
        const minC = Math.min(...selectedCols);
        const maxC = Math.max(...selectedCols);

        setTableData(
            tableData.map((row, ri) => ({
                id: row.id,
                cells: row.cells.map((cell, ci) => {
                    // if inside bounds
                    if (ri >= minR && ri <= maxR && ci >= minC && ci <= maxC) {
                        // top-left becomes the merged cell
                        if (ri === minR && ci === minC) {
                            return {
                                ...cell,
                                hidden: false,
                                rowspan: maxR - minR + 1,
                                colspan: maxC - minC + 1,
                            };
                        }
                        // hide all other cells in that block
                        return { ...cell, hidden: true };
                    }
                    return cell;
                }),
            })),
        );
        // clear selection
        setSelectedRows([]);
        setSelectedCols([]);
    };

    let handleUnmergeCells = () => {
        setTableData(
            tableData.map((row) => ({
                id: row.id,
                cells: row.cells.map((cell) => ({
                    ...cell,
                    hidden: false,
                    rowspan: 1,
                    colspan: 1,
                })),
            })),
        );
    };

    let handleSelectionAll = () => {
        const rowCount = tableData.length;
        const colCount = tableData[0].cells.length;
        setSelectedRows(Array.from({ length: rowCount }, (_, i) => i));
        setSelectedCols(Array.from({ length: colCount }, (_, i) => i));
    };

    let handleSelectionCol = (...colIndex) => {
        setSelectedCols([...colIndex]);
        setSelectedRows([]);
    };

    let handleSelectionRow = (...rowIndex) => {
        setSelectedRows([...rowIndex]);
        setSelectedCols([]);
    };

    let handleSelectionSingleCell = (rowIndex, colIndex) => {
        setSelectedCols([colIndex]);
        setSelectedRows([rowIndex]);
    };

    let handleCellContentChange = (
        { text, inlineStyles },
        rowIndex,
        colIndex,
    ) => {
        let newTableData = [
            ...tableData.slice(0, rowIndex),
            {
                id: tableData[rowIndex].id,
                cells: [
                    ...tableData[rowIndex].cells.slice(0, colIndex),
                    {
                        ...tableData[rowIndex].cells[colIndex],
                        content: text,
                        inlineStyles: inlineStyles,
                    },
                    ...tableData[rowIndex].cells.slice(colIndex + 1),
                ],
            },
            ...tableData.slice(rowIndex + 1),
        ];
        setTableData(newTableData);
    };

    const handleCellMouseDown = (e, r, c) => {
        setRecords({
            ...records,
            recording: true,
            start: [r, c],
        });
    };

    const handleCellMouseUp = (e, r, c) => {
        let start = records.start;
        let end = [r, c];
        let selection = getRectangleCells(...start, ...end);
        setSelectedRows(selection.rows);
        setSelectedCols(selection.cols);
        setRecords({
            ...records,
            recording: false,
            start: [0, 0],
        });
    };

    return (
        <div className="flex flex-col justify-start fixed top-0 left-0 p-4 h-full w-full max-w-screen overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-lg w-full">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer mr-4"
                        >
                            <Table2 className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleAddRow()}>
                            <Icon icon="AddRow" className="w-5 h-5" />
                            <span>Add Row</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAddCol()}>
                            <Icon icon="AddColumn" className="w-5 h-5" />
                            <span>Add Column</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleRemoveRow()}>
                            <Icon icon="DeleteRow" className="w-5 h-5" />
                            <span>Delete Row</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleRemoveColumn()}>
                            <Icon icon="DeleteColumn" className="w-5 h-5" />
                            <span>Delete Column</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                        >
                            <Grid2X2 className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleGroupCells()}>
                            <Icon icon="GroupCells" className="w-5 h-5" />
                            <span>Group Cells</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleUngroupCells()}>
                            <Icon icon="UngroupCells" className="w-5 h-5" />
                            <span>Ungroup Cells</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleMergeCells()}>
                            <TableCellsMerge className="w-5 h-5" />
                            <span>Merge Cells</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={() => handleUnmergeCells()}>
                            <TableCellsSplit className="w-5 h-5" />
                            <span>Split Cells</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex-grow"></div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={handleClose}
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-grow overflow-auto p-4">
                <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
                    <div className="overflow-x-auto relative">
                        <table className="w-full border-collapse min-w-max">
                            <thead>
                                <tr>
                                    <th
                                        className="w-10 h-10 bg-gray-100 border border-gray-300 cursor-pointer hover:bg-gray-200 sticky left-0 z-10"
                                        onClick={() => handleSelectionAll()}
                                    ></th>
                                    {tableData[0].cells.map(
                                        (cell, colIndex) => (
                                            <th
                                                key={cell.id}
                                                className={`px-3 py-2 border border-gray-300 font-semibold text-center cursor-pointer hover:bg-gray-200 ${selectedCols.includes(colIndex) ? "bg-blue-100" : "bg-gray-100"}`}
                                                onClick={() =>
                                                    handleSelectionCol(colIndex)
                                                }
                                            >
                                                {calculateColLetter(colIndex)}
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, rowIndex) => (
                                    <tr key={`row-${row.id}`}>
                                        <th
                                            className={`px-3 py-2 border border-gray-300 font-semibold text-center cursor-pointer hover:bg-gray-200 ${selectedRows.includes(rowIndex) ? "bg-blue-100" : "bg-gray-100"}`}
                                            onClick={() =>
                                                handleSelectionRow(rowIndex)
                                            }
                                        >
                                            {rowIndex + 1}
                                        </th>
                                        {row.cells.map(
                                            (cell, colIndex) =>
                                                cell.hidden === false && (
                                                    <td
                                                        key={cell.id}
                                                        rowSpan={
                                                            cell.rowspan || 1
                                                        }
                                                        colSpan={
                                                            cell.colspan || 1
                                                        }
                                                        className={`p-2 min-w-[100px] min-h-[40px] ${data.calculateBorders(cell.borders, rowIndex, colIndex, tableData)} ${
                                                            selectedRows.includes(
                                                                rowIndex,
                                                            ) &&
                                                            selectedCols.includes(
                                                                colIndex,
                                                            )
                                                                ? "bg-blue-50"
                                                                : (selectedRows.includes(
                                                                        rowIndex,
                                                                    ) &&
                                                                        selectedCols.length ===
                                                                            0) ||
                                                                    (selectedCols.includes(
                                                                        colIndex,
                                                                    ) &&
                                                                        selectedRows.length ===
                                                                            0)
                                                                  ? "bg-blue-50"
                                                                  : ""
                                                        }`}
                                                        onMouseDown={(e) =>
                                                            handleCellMouseDown(
                                                                e,
                                                                rowIndex,
                                                                colIndex,
                                                            )
                                                        }
                                                        onMouseUp={(e) =>
                                                            handleCellMouseUp(
                                                                e,
                                                                rowIndex,
                                                                colIndex,
                                                            )
                                                        }
                                                    >
                                                        <BasicTextEditor
                                                            text={cell.content}
                                                            inlineStyles={
                                                                cell.inlineStyles
                                                            }
                                                            onChange={(obj) =>
                                                                handleCellContentChange(
                                                                    obj,
                                                                    rowIndex,
                                                                    colIndex,
                                                                )
                                                            }
                                                            onFocus={() =>
                                                                handleSelectionSingleCell(
                                                                    rowIndex,
                                                                    colIndex,
                                                                )
                                                            }
                                                            readOnly={false}
                                                            tools={data.tools}
                                                            placeholder="Empty"
                                                        />
                                                    </td>
                                                ),
                                        )}
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

TableEditor.label = "table";
