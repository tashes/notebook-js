import React, { useState } from "react";
import { Button } from "../../ui/button";
import { X } from "lucide-react";

export default function ImageEditor({
    data = {},
    currentBlock = {},
    modifyBlock = () => {},
    close = () => {},
}) {
    return (
        <>
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <Button
                    variant="white"
                    className="cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        data.handleSelectImg();
                    }}
                >
                    Change Image
                </Button>
                <Button
                    variant="white"
                    size="icon"
                    className="cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        close();
                    }}
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>
            <img
                src={currentBlock.data.img}
                alt={currentBlock.data.text}
                className="max-w-[90%] max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
            />
        </>
    );
}

ImageEditor.label = "image";
