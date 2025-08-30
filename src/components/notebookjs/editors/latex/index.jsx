import React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import { useState } from "react";
import "katex/dist/katex.min.css";
import katex from "katex";
import { Button } from "../../ui/button";
import { useEffect } from "react";
import { Trash } from "lucide-react";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";

function isValidKaTeX(input) {
    try {
        katex.renderToString(input, { throwOnError: true });
        return true;
    } catch (e) {
        return false;
    }
}

export default function LatexEditor({
    data = {},
    currentBlock = {},
    modifyBlock = () => {},
    close = () => {},
}) {
    let [latex, setLatex] = useState(currentBlock.data.latex || "");
    let [latexError, setLatexError] = useState("");
    let [renderedLatex, setRenderedLatex] = useState(() => {
        let processedLatex = currentBlock.data.latex
            .split("\n")
            .map((line) => line.trim())
            .join(" \\\\ ");
        try {
            const html = katex.renderToString(processedLatex, {
                displayMode: true,
                throwOnError: true,
                errorColor: "#cc0000",
                strict: false,
            });
            setLatexError(null);
            return html;
        } catch (e) {
            setLatexError(e instanceof Error ? e.message : "Unknown error");
            try {
                const html = katex.renderToString(processedLatex, {
                    displayMode: true,
                    throwOnError: false,
                    errorColor: "#cc0000",
                    strict: false,
                });
                return html;
            } catch {
                return "";
            }
        }
    });
    let [variables, setVariables] = useState(currentBlock.data.variables || []);
    let [renderedVariables, setRenderedVariables] = useState(() => {
        if (latexError !== "") {
            let renderedItems = currentBlock.data.variables.map((item) => ({
                name: item.name,
                description: item.description,
                rendered: katex.renderToString(item.name, {
                    displayMode: true,
                    throwOnError: false,
                    errorColor: "#cc0000",
                    strict: false,
                }),
            }));
            return renderedItems;
        } else return [];
    });
    let [staged, setStaged] = useState(() => variables.map((v) => v.name));

    useEffect(() => {
        let processedLatex = latex
            .split("\n")
            .map((line) => line.trim())
            .join(" \\\\ ");
        try {
            const html = katex.renderToString(processedLatex, {
                displayMode: true,
                throwOnError: true,
                errorColor: "#cc0000",
                strict: false,
            });
            setRenderedLatex(html);
            setLatexError(null);
        } catch (e) {
            setLatexError(e instanceof Error ? e.message : "Unknown error");
            try {
                const html = katex.renderToString(processedLatex, {
                    displayMode: true,
                    throwOnError: false,
                    errorColor: "#cc0000",
                    strict: false,
                });
                setRenderedLatex(html);
            } catch {
                setRenderedLatex("");
            }
        }
    }, [latex]);

    useEffect(() => {
        if (latexError !== "") {
            let renderedItems = variables.map((item) => ({
                name: item.name,
                description: item.description,
                isEditing: false,
                rendered: katex.renderToString(item.name, {
                    displayMode: true,
                    throwOnError: false,
                    errorColor: "#cc0000",
                    strict: false,
                }),
            }));
            setRenderedVariables(renderedItems);
        }
    }, [variables, latexError]);

    let handleAddVariable = (e) => {
        setVariables([
            ...variables,
            {
                name: "",
                description: "",
            },
        ]);
    };

    let handleSetVariableName = (index) => {
        setRenderedVariables([
            ...renderedVariables.slice(0, index),
            {
                ...renderedVariables[index],
                isEditing: true,
            },
            ...renderedVariables.slice(index + 1),
        ]);
        setStaged(renderedVariables[index].name);
    };

    let handleUnsetVariableName = (index) => {
        let name = staged[index];
        let validity = isValidKaTeX(name);
        if (validity === true) {
            setVariables([
                ...variables.slice(0, index),
                {
                    ...variables[index],
                    name: name,
                },
                ...variables.slice(index + 1),
            ]);
        }
    };

    let handleVariableNameUpdate = (index, name) => {
        setStaged([
            ...staged.slice(0, index),
            name,
            ...staged.slice(index + 1),
        ]);
    };

    let handleVariableDescriptionUpdate = (text, index) => {
        setVariables([
            ...variables.slice(0, index),
            {
                ...variables[index],
                description: text,
            },
            ...variables.slice(index + 1),
        ]);
    };

    let handleRemoveVariable = (index) => {
        setVariables([
            ...variables.slice(0, index),
            ...variables.slice(index + 1),
        ]);
    };

    let handleLatexChange = (e) => {
        setLatex(e.target.value);
        setLatexError(null);
    };

    let handleDialogClose = () => {
        modifyBlock({
            ...currentBlock,
            data: {
                ...currentBlock.data,
                latex: latex,
                variables: variables,
            },
        });
        close();
    };

    return (
        <Dialog open={true} onOpenChange={handleDialogClose}>
            <DialogContent
                className="sm:max-w-[800px] overflow-y-auto z-50"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <DialogHeader>
                    <DialogTitle>Edit Latex</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="flex flex-col">
                        <div className="font-medium mb-2">LaTeX Code</div>
                        <Textarea
                            value={latex}
                            onChange={handleLatexChange}
                            className="flex-1 min-h-[200px] max-h-[400px] p-2 border rounded font-mono text-sm"
                            placeholder="Enter LaTeX code..."
                        ></Textarea>
                    </div>
                    <div className="flex flex-col">
                        <div className="font-medium mb-2">Preview</div>
                        <div className="flex-1 border rounded p-4 bg-card text-foreground overflow-auto max-h-[400px]">
                            {latex.trim() !== "" ? (
                                <>
                                    <div
                                        className="katex-display w-full"
                                        dangerouslySetInnerHTML={{
                                            __html: renderedLatex,
                                        }}
                                    />
                                    {latexError && (
                                        <div className="text-red-500 text-sm mt-2">
                                            {latexError}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="text-muted-foreground italic">
                                        Preview will appear here
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="">
                    <div className="font-medium mb-2">Variables</div>
                    <div className="overflow-auto max-h-[300px] pr-2">
                        <div className="grid grid-cols-1 gap-4 p-2">
                            {renderedVariables.length > 0 &&
                                renderedVariables.map((v, i) => (
                                    <div
                                        key={`${v.name}-${i}`}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="w-48 text-center">
                                            {v.isEditing ? (
                                                <Input
                                                    value={staged[i]}
                                                    placeholder="Type variable name..."
                                                    onChange={(e) =>
                                                        handleVariableNameUpdate(
                                                            i,
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        handleUnsetVariableName(
                                                            i,
                                                        )
                                                    }
                                                />
                                            ) : v.name !== "" ? (
                                                <span
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        handleSetVariableName(i)
                                                    }
                                                    dangerouslySetInnerHTML={{
                                                        __html: v.rendered,
                                                    }}
                                                />
                                            ) : (
                                                <Input
                                                    value={staged[i]}
                                                    placeholder="Type variable name..."
                                                    onChange={(e) =>
                                                        handleVariableNameUpdate(
                                                            i,
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        handleUnsetVariableName(
                                                            i,
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                value={v.description}
                                                placeholder="Type variable description..."
                                                onChange={(e) =>
                                                    handleVariableDescriptionUpdate(
                                                        e.target.value,
                                                        i,
                                                    )
                                                }
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-12 h-12 cursor-pointer"
                                            onClick={() =>
                                                handleRemoveVariable(i)
                                            }
                                        >
                                            <Trash className="w-6 h-6" />
                                        </Button>
                                    </div>
                                ))}
                            <Button
                                className="cursor-pointer"
                                variant="ghost"
                                onClick={handleAddVariable}
                            >
                                Add Variable
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

LatexEditor.label = "latex";
