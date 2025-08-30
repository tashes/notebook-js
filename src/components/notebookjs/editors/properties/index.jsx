import React, { useState } from "react";

import { Plus, Trash2 } from "lucide-react";
import { PROPKEY } from "../../data/const";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../ui/table";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

export default function PropertiesEditor({
    data = {},
    currentBlock = {},
    modifyBlock = () => {},
    close = () => {},
}) {
    let [props, setProps] = useState(currentBlock.props);

    let handleDialogClose = () => {
        close();
    };

    let validateKey = (key) => {
        return PROPKEY.test(key);
    };

    let getInvalidKeys = () => {
        return Object.keys(props).filter((key) => !validateKey(key));
    };

    let updatePropertyKey = (oldKey, newKey) => {
        if (oldKey !== newKey) {
            const newProps = { ...props };
            const value = newProps[oldKey];
            delete newProps[oldKey];
            newProps[newKey] = value;
            setProps(newProps);
        }
    };

    let updatePropertyValue = (key, value) => {
        setProps((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    let deleteProperty = (key) => {
        const newProps = { ...props };
        delete newProps[key];
        setProps(newProps);
    };

    let addProperty = () => {
        const newKey = `property${Object.keys(props).length + 1}`;
        setProps((prev) => ({
            ...prev,
            [newKey]: "",
        }));
    };

    let saveProps = () => {
        let invalidKeys = getInvalidKeys();
        if (invalidKeys.length === 0) {
            currentBlock.props = props;
            modifyBlock(currentBlock);
            close();
        }
    };

    return (
        <Dialog open={true} onOpenChange={handleDialogClose}>
            <DialogContent
                className="max-w-2xl max-h-[80vh] overflow-y-auto z-50"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <DialogHeader>
                    <DialogTitle>Edit Props</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/3">Key</TableHead>
                                    <TableHead className="w-1/2">
                                        Value
                                    </TableHead>
                                    <TableHead className="w-16">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(props).map(
                                    ([key, value], index) => (
                                        <TableRow key={`${index}`}>
                                            <TableCell>
                                                <Input
                                                    value={key}
                                                    onChange={(e) =>
                                                        updatePropertyKey(
                                                            key,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Property key"
                                                    className={`border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none ${!validateKey(key) ? "text-red-500" : ""}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={value}
                                                    onChange={(e) =>
                                                        updatePropertyValue(
                                                            key,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Property value"
                                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        deleteProperty(key)
                                                    }
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Delete property
                                                    </span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <Button
                        onClick={addProperty}
                        variant="outline"
                        className="w-full"
                        type="button"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Property
                    </Button>
                    <Button
                        onClick={saveProps}
                        className="w-full"
                        type="button"
                        disabled={!(getInvalidKeys().length === 0)}
                    >
                        Save Props
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

PropertiesEditor.label = "properties";
