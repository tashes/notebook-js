import React, { forwardRef } from "react";
import { Table2 } from "lucide-react";
import BaseTextEditor from "../components/base-text-editor";
import BasicTextEditor from "../components/basic-text-editor";

const TableBlock = forwardRef(function (
    {
        id = "",
        readOnly = false,
        data = {},
        props = {},
        tools = [],
        references = { search: () => {}, open: () => {} },
        shortcuts = [],
        dispatcher = () => {},
        openEditor = () => {},
    },
    ref,
) {
    // Open the modal editor, passing in our calculateBorders helper
    const handleEditTable = () => {
        openEditor("table", {
            tools,
            calculateBorders,
        });
    };

    function calculateBorders(borders, rowIndex, colIndex, data) {
        const classNames = [];

        // Top border
        let topStrong = borders;
        if (rowIndex > 0 && data[rowIndex - 1]?.[colIndex]) {
            const above = data[rowIndex - 1][colIndex];
            topStrong = topStrong || above.borders; // above cell's bottom
        }
        classNames.push(
            `border-t ${topStrong ? "border-t-gray-400" : "border-t-gray-100"}`,
        );

        // Bottom border
        let bottomStrong = borders;
        if (rowIndex < data.length - 1 && data[rowIndex + 1]?.[colIndex]) {
            const below = data[rowIndex + 1][colIndex];
            bottomStrong = bottomStrong || below.borders; // below cell's top
        }
        classNames.push(
            `border-b ${bottomStrong ? "border-b-gray-400" : "border-b-gray-100"}`,
        );

        // Left border
        let leftStrong = borders;
        if (colIndex > 0 && data[rowIndex]?.[colIndex - 1]) {
            const left = data[rowIndex][colIndex - 1];
            leftStrong = leftStrong || left.borders; // left cell's right
        }
        classNames.push(
            `border-l ${leftStrong ? "border-l-gray-400" : "border-l-gray-100"}`,
        );

        // Right border
        let rightStrong = borders;
        if (
            colIndex < data[rowIndex].length - 1 &&
            data[rowIndex]?.[colIndex + 1]
        ) {
            const right = data[rowIndex][colIndex + 1];
            rightStrong = rightStrong || right.borders; // right cell's left
        }
        classNames.push(
            `border-r ${rightStrong ? "border-r-gray-400" : "border-r-gray-100"}`,
        );

        return classNames.join(" ");
    }

    return (
        <div className="flex-grow mx-2 overflow-hidden">
            <div className="my-2 relative overflow-auto">
                {data.rows.length > 0 ? (
                    <table
                        className="w-full border-collapse min-w-max text-gray-600 cursor-pointer"
                        onClick={handleEditTable}
                    >
                        <tbody>
                            {data.rows.map((row, rowIndex) => (
                                <tr key={`preview-row-${rowIndex}`}>
                                    {row.map((cell, colIndex) => {
                                        const Ele = cell.isHeader ? "th" : "td";
                                        return (
                                            cell.hidden === false && (
                                                <Ele
                                                    key={`preview-cell-${rowIndex}-${colIndex}`}
                                                    className={`text-sm p-2 min-w-[100px] min-h-[40px] ${calculateBorders(
                                                        cell.borders,
                                                        rowIndex,
                                                        colIndex,
                                                        data.rows,
                                                    )}`}
                                                    rowSpan={cell.rowspan || 1}
                                                    colSpan={cell.colspan || 1}
                                                >
                                                    <BasicTextEditor
                                                        text={cell.content}
                                                        inlineStyles={
                                                            cell.inlineStyles
                                                        }
                                                        readOnly={true}
                                                        tools={tools}
                                                        placeholder="Empty"
                                                    />
                                                </Ele>
                                            )
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div
                        className="border border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer"
                        onClick={handleEditTable}
                    >
                        <Table2 className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Add a table</p>
                    </div>
                )}
            </div>

            <div className="cursor-pointer relative">
                <div className="text-xs text-gray-600">
                    <BaseTextEditor
                        id={id}
                        iText={data.text || ""}
                        iInlineStyles={data.inlineStyles || []}
                        blockType={TableBlock}
                        placeholder="Type table caption text..."
                        tools={tools}
                        references={references}
                        readOnly={readOnly}
                        shortcuts={shortcuts}
                        props={props}
                        dispatcher={dispatcher}
                        ref={ref}
                    />
                </div>
            </div>
        </div>
    );
});

TableBlock.label = "Table";
TableBlock.icon = "T";
TableBlock.type = "table";
TableBlock.shortcut = "Cmd+Y";
TableBlock.init = () => ({
    text: "",
    inlineStyles: [],
    rows: [
        [
            {
                content: "",
                inlineStyles: [],
                hidden: false,
                rowspan: 1,
                colspan: 1,
                isHeader: false,
                groupId: "",
                borders: true,
            },
            {
                content: "",
                inlineStyles: [],
                hidden: false,
                rowspan: 1,
                colspan: 1,
                isHeader: false,
                groupId: "",
                borders: true,
            },
        ],
        [
            {
                content: "",
                inlineStyles: [],
                hidden: false,
                rowspan: 1,
                colspan: 1,
                isHeader: false,
                groupId: "",
                borders: true,
            },
            {
                content: "",
                inlineStyles: [],
                hidden: false,
                rowspan: 1,
                colspan: 1,
                isHeader: false,
                groupId: "",
                borders: true,
            },
        ],
    ],
});
TableBlock.menuItems = [];
TableBlock.followingBlock = "paragraph";

export default TableBlock;
