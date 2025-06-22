import React, { useRef, useEffect, forwardRef } from "react";
import BaseTextEditor from "../components/base-text-editor";
import { SquareEqual } from "lucide-react";
import katex from "katex";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "../ui/accordion";
import BasicTextEditor from "../components/basic-text-editor";

const LatexBlock = forwardRef(function (
    {
        id = "",
        readOnly = false,
        data = {},
        props = {},
        tools = [],
        references = {
            search: () => {},
            open: () => {},
        },
        shortcuts = [],
        dispatcher = () => {},
        openEditor = () => {},
    },
    ref,
) {
    const handleOpenLatex = () => {
        openEditor("latex", {});
    };

    let renderedLatex = katex.renderToString(
        data.latex
            .split("\n")
            .map((line) => line.trim())
            .join(" \\\\ "),
        {
            displayMode: true,
            throwOnError: false,
            errorColor: "#cc0000",
            strict: false,
        },
    );

    let shouldShowVariables = data.variables.some(
        (v) => v.description.length > 0,
    );

    let renderedVariables = data.variables.map((v) => ({
        name: v.name,
        description: v.description,
        rendered: katex.renderToString(v.name, {
            displayMode: true,
            throwOnError: false,
            errorColor: "#cc0000",
            strict: false,
        }),
    }));

    return (
        <div className="flex-grow mx-2">
            <div className="my-2 relative">
                {data.latex ? (
                    <>
                        <div
                            className="katex-display w-full border border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer"
                            onClick={handleOpenLatex}
                            dangerouslySetInnerHTML={{
                                __html: renderedLatex,
                            }}
                        />
                        {shouldShowVariables && (
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                <AccordionItem value="info">
                                    <AccordionTrigger>
                                        Variables
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {renderedVariables.map((v) => (
                                            <div
                                                key={v.name}
                                                className="flex items-center gap-2 bg-gray-100"
                                            >
                                                <div className="w-48 text-center">
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: v.rendered,
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <span>{v.description}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )}
                    </>
                ) : (
                    <div
                        className="border border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer"
                        onClick={handleOpenLatex}
                    >
                        <SquareEqual className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Add a Latex Equation</p>
                    </div>
                )}
            </div>
            <div className="cursor-text relative">
                <div className="text-xs text-gray-600">
                    <BaseTextEditor
                        id={id}
                        iText={data.text || ""}
                        iInlineStyles={data.inlineStyles || []}
                        blockType={LatexBlock}
                        placeholder="Type latex caption text..."
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

LatexBlock.label = "Latex";
LatexBlock.icon = "L";
LatexBlock.type = "latex";
LatexBlock.shortcut = "Cmd+K";
LatexBlock.init = () => ({
    text: "",
    inlineStyles: [],
    latex: "",
    variables: [],
});
LatexBlock.menuItems = [
    {
        name: "Edit Latex",
        action: (_, { openEditor }) => {
            openEditor("latex", {});
        },
    },
];
LatexBlock.followingBlock = "paragraph";

export default LatexBlock;
