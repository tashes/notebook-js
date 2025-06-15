import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";

export default function SetNumberingEditor({
    data = {
        calc: () => {},
        max: 4,
        modifyOrderedListBlocks: () => {},
    },
    currentBlock = {},
    modifyBlock = () => {},
    close = () => {},
}) {
    let [numbering, setNumbering] = useState(currentBlock.data.numbering);
    let [numberingText, setNumberingText] = useState(data.calc(numbering));

    useEffect(() => {
        if (validateNumbering(numberingText)) {
            let split = numberingText.split(".").map((a) => parseInt(a));
            while (split.length < data.max) {
                split.push(0);
            }
            setNumbering(split);
        }
    }, [numberingText]);

    let handleDialogClose = () => {
        close();
    };

    let validateNumbering = (numText) => {
        // Rule 1: should only contain digits and dots
        if (!/^[0-9.]+$/.test(numText)) {
            return false;
        }

        if (numText[numText.length - 1] === ".") {
            return false;
        }

        const parts = numText.split(".");

        // Rule 2: number of parts must be less than MAX
        if (parts.length > data.max) {
            return false;
        }

        // Rule 3: last number must not be 0
        const last = parts[parts.length - 1];
        if (last === "0") {
            return false;
        }

        return true;
    };

    let updateNumbering = (num) => {
        setNumberingText(num);
    };

    let saveNumbering = () => {
        if (validateNumbering(numberingText)) {
            modifyBlock({
                ...currentBlock,
                data: {
                    ...currentBlock.data,
                    numbering: numbering,
                    manual: true,
                    indentation: numberingText.split(".").length,
                },
            });
            close();
        }
    };

    let resetNumbering = () => {
        modifyBlock({
            ...currentBlock,
            data: {
                ...currentBlock.data,
                manual: false,
            },
        });
        close();
    };

    return (
        <Dialog open={true} onOpenChange={handleDialogClose}>
            <DialogContent
                className="max-w-2xl max-h-[80vh] overflow-y-auto z-50 bg-white"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <DialogHeader>
                    <DialogTitle>Set Numbering</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="rounded-md border">
                        <Input
                            value={numberingText}
                            onChange={(e) => updateNumbering(e.target.value)}
                            placeholder="Numbering"
                            className={`border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none ${!validateNumbering(numberingText) ? "text-red-500" : ""}`}
                        />
                    </div>
                    <Button
                        onClick={saveNumbering}
                        className="w-full"
                        type="button"
                        disabled={!validateNumbering(numberingText)}
                    >
                        Save Numbering
                    </Button>
                    <Button
                        onClick={resetNumbering}
                        variant="outline"
                        type="button"
                        className="w-full"
                        disabled={!currentBlock.data.manual}
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Reset Numbering
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

SetNumberingEditor.label = "set-numbering";
