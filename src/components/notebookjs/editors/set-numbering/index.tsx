import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { RefreshCcw } from "lucide-react";

type Props = { data?: { calc: (n: number[]) => string; max: number; modifyOrderedListBlocks?: () => void }; currentBlock?: any; modifyBlock?: (b: any) => void; close?: () => void };

export default function SetNumberingEditor({ data = { calc: () => "", max: 4, modifyOrderedListBlocks: () => {} }, currentBlock = {}, modifyBlock = () => {}, close = () => {} }: Props) {
  const [numbering, setNumbering] = useState<number[]>(currentBlock.data.numbering);
  const [numberingText, setNumberingText] = useState<string>(data.calc(numbering));
  useEffect(() => {
    if (validateNumbering(numberingText)) {
      const split = numberingText.split(".").map((a) => parseInt(a));
      while (split.length < data.max) split.push(0);
      setNumbering(split);
    }
  }, [numberingText]);
  const handleDialogClose = () => close();
  const validateNumbering = (numText: string) => {
    if (!/^[0-9.]+$/.test(numText)) return false;
    if (numText[numText.length - 1] === ".") return false;
    const parts = numText.split(".");
    if (parts.length > data.max) return false;
    const last = parts[parts.length - 1];
    if (last === "0") return false;
    return true;
  };
  const updateNumbering = (num: string) => setNumberingText(num);
  const saveNumbering = () => {
    if (validateNumbering(numberingText)) {
      modifyBlock({ ...currentBlock, data: { ...currentBlock.data, numbering, manual: true, indentation: numberingText.split(".").length } });
      close();
    }
  };
  const resetNumbering = () => { modifyBlock({ ...currentBlock, data: { ...currentBlock.data, manual: false } }); close(); };
  return (
    <Dialog open={true} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto z-50" onClick={(e) => e.stopPropagation()}>
        <DialogHeader><DialogTitle>Set Numbering</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border">
            <Input value={numberingText} onChange={(e) => updateNumbering((e.target as HTMLInputElement).value)} placeholder="Numbering" className={`border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none ${!validateNumbering(numberingText) ? "text-red-500" : ""}`} />
          </div>
          <Button onClick={saveNumbering} className="w-full" type="button" disabled={!validateNumbering(numberingText)}>Save Numbering</Button>
          <Button onClick={resetNumbering} variant="outline" type="button" className="w-full" disabled={!currentBlock.data.manual}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset Numbering
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

(SetNumberingEditor as any).label = "set-numbering";

