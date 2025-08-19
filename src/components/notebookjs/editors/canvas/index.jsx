import React, { useRef, useState } from "react";
import { Button } from "../../ui/button";
import { X } from "lucide-react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "./index.css";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";

export default function CanvasEditor({
    data = {},
    currentBlock = {},
    modifyBlock = () => {},
    close = () => {},
}) {
    const excalidrawRef = useRef(null);
    const [elements, setElements] = useState(currentBlock.data.elements || []);
    const [appState, setAppState] = useState({
        viewBackgroundColor: "#ffffff",
    });
    const [files, setFiles] = useState(currentBlock.data.files || {});

    const handleClose = () => {
        // propagate updated elements and files as a new block object
        const filteredElements = elements.filter((e) => e.isDeleted === false);

        modifyBlock({
            ...currentBlock,
            data: {
                ...currentBlock.data,
                elements: filteredElements,
                files: Object.fromEntries(
                    Object.entries(files).filter(([k]) =>
                        filteredElements.some((e) => e.fileId === k),
                    ),
                ),
            },
        });
        // close the editor
        close();
    };

    return (
        <>
            <Dialog open={true} onOpenChange={handleClose}>
                <DialogContent
                    className="sm:max-w-[800px] overflow-y-auto z-50 bg-white"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Edit Canvas</DialogTitle>
                    </DialogHeader>

                    {/* Excalidraw canvas */}
                    <div
                        className="w-full h-[80vh] border"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <Excalidraw
                            ref={excalidrawRef}
                            initialData={{
                                elements,
                                appState,
                                files,
                                scrollToContent: true,
                            }}
                            onChange={(elements, appState, files) => {
                                // shallow clone the elements array to ensure state updates on deletion
                                setElements(elements);
                                setAppState(appState);
                                setFiles(files);
                            }}
                            isCollaborating={false}
                            UIOptions={{
                                canvasActions: {
                                    changeViewBackgroundColor: false,
                                    clearCanvas: false,
                                    export: false,
                                    loadScene: false,
                                    saveToActiveFile: false,
                                    toggleTheme: false,
                                    saveAsImage: false,
                                },
                                welcomeScreen: false,
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

CanvasEditor.label = "canvas";
