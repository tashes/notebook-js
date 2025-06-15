import React, { useRef, useEffect, forwardRef } from "react";
import { PencilRuler } from "lucide-react";
import BaseTextEditor from "../components/base-text-editor";
import { exportToCanvas, restoreElements } from "@excalidraw/excalidraw";
import { useMemo } from "react";

const CanvasBlock = forwardRef(function (
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
    const canvasRef = useRef(null);
    const cacheRef = useRef(new Map());

    const cacheKey = useMemo(() => {
        try {
            return JSON.stringify({
                elements: data.elements,
                files: data.files,
            });
        } catch {
            return null;
        }
    }, [data.elements, data.files]);

    useEffect(() => {
        async function renderPreview() {
            if (!data.elements || !canvasRef.current || !cacheKey) return;

            const cachedCanvas = cacheRef.current.get(cacheKey);
            if (cachedCanvas) {
                drawToCanvas(cachedCanvas);
                return;
            }

            const restoredElements = restoreElements(data.elements, null);
            const canvas = await exportToCanvas({
                elements: restoredElements,
                appState: {
                    viewBackgroundColor: "#ffffff",
                },
                files: data.files,
            });

            cacheRef.current.set(cacheKey, canvas);
            drawToCanvas(canvas);
        }

        function drawToCanvas(canvas) {
            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) return;

            canvasRef.current.width = canvas.width;
            canvasRef.current.height = canvas.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(canvas, 0, 0);
        }

        renderPreview();
    }, [cacheKey, data.elements, data.files]);

    const handleOpenCanvas = () => {
        openEditor("canvas", {});
    };

    return (
        <div className="flex-grow mx-2">
            <div className="my-2 relative">
                {data.elements ? (
                    <div
                        className="h-[400px] border rounded-md overflow-hidden bg-white cursor-pointer flex items-center justify-center"
                        onClick={handleOpenCanvas}
                    >
                        <canvas
                            ref={canvasRef}
                            className="max-w-full max-h-full"
                        />
                    </div>
                ) : (
                    <div
                        className="border border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer"
                        onClick={handleOpenCanvas}
                    >
                        <PencilRuler className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Add a canvas</p>
                    </div>
                )}
            </div>
            <div className="cursor-text relative">
                <div className="text-xs text-gray-600">
                    <BaseTextEditor
                        id={id}
                        iText={data.text || ""}
                        iInlineStyles={data.inlineStyles || []}
                        blockType={CanvasBlock}
                        placeholder="Type canvas caption text..."
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

CanvasBlock.label = "Canvas";
CanvasBlock.icon = "C";
CanvasBlock.type = "canvas";
CanvasBlock.shortcut = "Cmd+C";
CanvasBlock.init = () => ({
    text: "",
    inlineStyles: [],
    elements: null,
    files: {},
});
CanvasBlock.menuItems = [
    {
        name: "Edit Canvas",
        action: (_, { openEditor }) => {
            openEditor("canvas", {});
        },
    },
    {
        name: "Convert To Image Block",
        action: async ({ currentBlock }, { modifyBlock }) => {
            async function exportExcalidrawToDataURL(elements, files) {
                if (!elements || elements.length === 0) return null;

                const restoredElements = restoreElements(elements, null);

                const canvas = await exportToCanvas({
                    elements: restoredElements,
                    appState: {
                        viewBackgroundColor: "#ffffff",
                    },
                    files,
                });

                return canvas;
            }

            let drawing = await exportExcalidrawToDataURL(
                currentBlock.data.elements,
                currentBlock.data.files,
            );

            let width = drawing.width;
            let height = drawing.height;
            const maxWidth = 1200;
            const maxHeight = 800;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }

            // Create a canvas for resizing
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");

            // Draw with white background for JPEGs
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(drawing, 0, 0, width, height);

            // Get the optimized image data
            const optimizedImageData = canvas.toDataURL("image/jpeg", 0.7);

            modifyBlock({
                ...currentBlock,
                type: "image",
                data: {
                    text: currentBlock.text,
                    inlineStyles: currentBlock.inlineStyles,
                    img: optimizedImageData,
                },
            });
        },
    },
];
CanvasBlock.followingBlock = "paragraph";

export default CanvasBlock;
