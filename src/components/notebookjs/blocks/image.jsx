import React from "react";
import BaseTextEditor from "../components/base-text-editor";
import { forwardRef } from "react";
import { ImageIcon } from "lucide-react";
import { useRef } from "react";

const ImageBlock = forwardRef(function (
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
        block = {},
        dispatcher = () => {},
        openEditor = () => {},
    },
    ref,
) {
    let fileInputRef = useRef(null);

    let handleSelectImg = () => {
        fileInputRef.current?.click();
    };

    let handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target?.result + "";

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                const maxWidth = 1200;
                const maxHeight = 800;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(
                        maxWidth / width,
                        maxHeight / height,
                    );
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
                ctx.drawImage(img, 0, 0, width, height);

                // Get the optimized image data
                const optimizedImageData = canvas.toDataURL("image/jpeg", 0.7);

                dispatcher({
                    type: "modify-raw-block",
                    block: {
                        ...block,
                        data: {
                            ...block.data,
                            img: optimizedImageData,
                        },
                    },
                });
            };

            img.src = imageData;
        };

        reader.readAsDataURL(file);
    };

    let handleOpenImg = () => {
        openEditor("image", {
            handleSelectImg,
        });
    };

    return (
        <div className="flex-grow mx-2">
            <div className="my-2 relative">
                {data.img !== "" ? (
                    <img
                        src={data.img}
                        alt={data.text}
                        className="max-w-full rounded-md border border-gray-200 cursor-pointer"
                        onClick={handleOpenImg}
                    />
                ) : (
                    <div
                        className="border border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer"
                        onClick={handleSelectImg}
                    >
                        <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Add an image</p>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>
            <div className="cursor-text relative">
                <div className="text-xs text-gray-600">
                    <BaseTextEditor
                        id={id}
                        iText={data.text || ""}
                        iInlineStyles={data.inlineStyles || []}
                        blockType={ImageBlock}
                        placeholder="Type image caption text..."
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

ImageBlock.label = "Image";
ImageBlock.icon = "I";
ImageBlock.type = "image";
ImageBlock.shortcut = "Cmd+I";
ImageBlock.init = () => ({
    text: "",
    inlineStyles: [],
    img: "",
});
ImageBlock.menuItems = [
    {
        name: "Change Image",
        action: async ({ blockObj }, { modifyBlock }) => {
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [
                        {
                            description: "Image files",
                            accept: {
                                "image/*": [
                                    ".png",
                                    ".jpg",
                                    ".jpeg",
                                    ".gif",
                                    ".webp",
                                    ".bmp",
                                    ".svg",
                                ],
                            },
                        },
                    ],
                    excludeAcceptAllOption: true,
                    multiple: false,
                });

                const file = await fileHandle.getFile();

                const imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) =>
                        resolve(event.target?.result + "");
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const img = new Image();
                img.crossOrigin = "anonymous";

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = imageData;
                });

                let width = img.width;
                let height = img.height;
                const maxWidth = 1200;
                const maxHeight = 800;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(
                        maxWidth / width,
                        maxHeight / height,
                    );
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");

                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const optimizedImageData = canvas.toDataURL("image/jpeg", 0.7);

                blockObj.data.img = optimizedImageData;
                modifyBlock(blockObj);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("File picker error:", err);
                }
            }
        },
    },
];
ImageBlock.followingBlock = "paragraph";

export default ImageBlock;
