import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import "./index.css";

type Props = { data?: any; currentBlock?: any; modifyBlock?: (b: any) => void; close?: () => void };

export default function CanvasEditor({ data = {}, currentBlock = {}, modifyBlock = () => {}, close = () => {} }: Props) {
  const excalidrawRef = useRef<any>(null);
  const [ExcalidrawComp, setExcalidrawComp] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try { const mod = await import("@excalidraw/excalidraw"); await import("@excalidraw/excalidraw/index.css"); if (mounted) setExcalidrawComp(() => mod.Excalidraw); }
      catch (e) { console.error("Failed to load Excalidraw", e); }
    })();
    return () => { mounted = false; };
  }, []);
  const [elements, setElements] = useState<any[]>(currentBlock.data.elements || []);
  const [appState, setAppState] = useState<any>({ viewBackgroundColor: "#ffffff" });
  const [files, setFiles] = useState<Record<string, any>>(currentBlock.data.files || {});
  const handleClose = () => {
    const filteredElements = elements.filter((e: any) => e.isDeleted === false);
    modifyBlock({ ...currentBlock, data: { ...currentBlock.data, elements: filteredElements, files: Object.fromEntries(Object.entries(files).filter(([k]) => filteredElements.some((e: any) => e.fileId === k))) } });
    close();
  };
  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] overflow-y-auto z-50" onClick={(e) => e.stopPropagation()}>
        <DialogHeader><DialogTitle>Edit Canvas</DialogTitle></DialogHeader>
        <div className="w-full h-[80vh] border" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onMouseUp={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          {ExcalidrawComp ? (
            <ExcalidrawComp
              ref={excalidrawRef}
              initialData={{ elements, appState, files, scrollToContent: true }}
              onChange={(elements: any, appState: any, files: any) => { setElements(elements); setAppState(appState); setFiles(files); }}
              isCollaborating={false}
              UIOptions={{ canvasActions: { changeViewBackgroundColor: false, clearCanvas: false, export: false, loadScene: false, saveToActiveFile: false, toggleTheme: false, saveAsImage: false }, welcomeScreen: false }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading canvas…</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

(CanvasEditor as any).label = "canvas";

