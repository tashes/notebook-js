import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import "katex/dist/katex.min.css";
import katex from "katex";
import { Button } from "../../ui/button";
import { Trash } from "lucide-react";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";

function isValidKaTeX(input: string) {
  try { katex.renderToString(input, { throwOnError: true }); return true; } catch { return false; }
}

type Props = { data?: any; currentBlock?: any; modifyBlock?: (b: any) => void; close?: () => void };

export default function LatexEditor({ data = {}, currentBlock = {}, modifyBlock = () => {}, close = () => {} }: Props) {
  const [latex, setLatex] = useState<string>(currentBlock.data.latex || "");
  const [latexError, setLatexError] = useState<string | null>("");
  const [renderedLatex, setRenderedLatex] = useState<string>(() => {
    const processedLatex = (currentBlock.data.latex || "").split("\n").map((line: string) => line.trim()).join(" \\\\ ");
    try { const html = katex.renderToString(processedLatex, { displayMode: true, throwOnError: true, errorColor: "#cc0000", strict: false }); setLatexError(null); return html; }
    catch (e: any) { setLatexError(e?.message || "Unknown error"); try { return katex.renderToString(processedLatex, { displayMode: true, throwOnError: false, errorColor: "#cc0000", strict: false }); } catch { return ""; } }
  });
  const [variables, setVariables] = useState<any[]>(currentBlock.data.variables || []);
  const [renderedVariables, setRenderedVariables] = useState<any[]>(() => {
    if (latexError !== "") return currentBlock.data.variables.map((item: any) => ({ name: item.name, description: item.description, rendered: katex.renderToString(item.name, { displayMode: true, throwOnError: false, errorColor: "#cc0000", strict: false }) }));
    else return [];
  });
  const [staged, setStaged] = useState<string[]>(() => variables.map((v) => v.name));

  useEffect(() => {
    const processedLatex = latex.split("\n").map((line) => line.trim()).join(" \\\\ ");
    try { const html = katex.renderToString(processedLatex, { displayMode: true, throwOnError: true, errorColor: "#cc0000", strict: false }); setRenderedLatex(html); setLatexError(null); }
    catch (e: any) { setLatexError(e?.message || "Unknown error"); try { const html = katex.renderToString(processedLatex, { displayMode: true, throwOnError: false, errorColor: "#cc0000", strict: false }); setRenderedLatex(html); } catch { setRenderedLatex(""); } }
  }, [latex]);

  useEffect(() => {
    if (latexError !== "") {
      setRenderedVariables(variables.map((item) => ({ name: item.name, description: item.description, isEditing: false, rendered: katex.renderToString(item.name, { displayMode: true, throwOnError: false, errorColor: "#cc0000", strict: false }) })));
    }
  }, [variables, latexError]);

  const handleAddVariable = () => setVariables([...variables, { name: "", description: "" }]);
  const handleSetVariableName = (index: number) => { setRenderedVariables([...renderedVariables.slice(0, index), { ...renderedVariables[index], isEditing: true }, ...renderedVariables.slice(index + 1)]); setStaged(renderedVariables[index].name); };
  const handleUnsetVariableName = (index: number) => { const name = staged[index]; if (isValidKaTeX(name)) setVariables([...variables.slice(0, index), { ...variables[index], name }, ...variables.slice(index + 1)]); };
  const handleVariableNameUpdate = (index: number, name: string) => setStaged([...staged.slice(0, index), name, ...staged.slice(index + 1)]);
  const handleVariableDescriptionUpdate = (text: string, index: number) => setVariables([...variables.slice(0, index), { ...variables[index], description: text }, ...variables.slice(index + 1)]);
  const handleRemoveVariable = (index: number) => setVariables([...variables.slice(0, index), ...variables.slice(index + 1)]);
  const handleLatexChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setLatex(e.target.value); setLatexError(null); };
  const handleDialogClose = () => { modifyBlock({ ...currentBlock, data: { ...currentBlock.data, latex, variables } }); close(); };

  return (
    <Dialog open={true} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[800px] overflow-y-auto z-50" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit Latex</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="flex flex-col">
            <div className="font-medium mb-2">LaTeX Code</div>
            <Textarea value={latex} onChange={handleLatexChange} className="flex-1 min-h[200px] max-h-[400px] p-2 border rounded font-mono text-sm" placeholder="Enter LaTeX code..."></Textarea>
          </div>
          <div className="flex flex-col">
            <div className="font-medium mb-2">Preview</div>
            <div className="flex-1 border rounded p-4 bg-card text-foreground overflow-auto max-h-[400px]">
              {latex.trim() !== "" ? (
                <>
                  <div className="katex-display w-full" dangerouslySetInnerHTML={{ __html: renderedLatex }} />
                  {latexError && <div className="text-red-500 text-sm mt-2">{latexError}</div>}
                </>
              ) : (
                <div className="text-muted-foreground italic">Preview will appear here</div>
              )}
            </div>
          </div>
          {latexError && (
            <div className="col-span-1 md:col-span-2">
              <div className="font-medium mb-2">Variables (rendering requires valid LaTeX)</div>
              <div className="space-y-2">
                {renderedVariables.map((vi, i) => (
                  <div key={`var-${i}`} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-32 text-sm text-muted-foreground">Name</div>
                        <div className="flex-1">
                          <Input value={vi.name} onChange={(e) => handleVariableNameUpdate(i, (e.target as HTMLInputElement).value)} onBlur={() => handleUnsetVariableName(i)} placeholder="e.g. a_i" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-32 text-sm text-muted-foreground">Description</div>
                        <div className="flex-1">
                          <Input value={vi.description} onChange={(e) => handleVariableDescriptionUpdate((e.target as HTMLInputElement).value, i)} placeholder="Description" />
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="w-12 h-12 cursor-pointer" onClick={() => handleRemoveVariable(i)}>
                      <Trash className="w-6 h-6" />
                    </Button>
                  </div>
                ))}
                <Button className="cursor-pointer" variant="ghost" onClick={handleAddVariable}>Add Variable</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

(LatexEditor as any).label = "latex";

