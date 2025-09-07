import React, { useRef, useEffect, forwardRef, useMemo } from "react";
import { PencilRuler } from "lucide-react";
import BaseTextEditor from "../components/base-text-editor";
import { exportToCanvas, restoreElements } from "@excalidraw/excalidraw";
import type { BlockComponent, BlockProps, CanvasBlockData } from "../types";

const CanvasBlockInner = forwardRef<any, BlockProps<CanvasBlockData>>(function (
  { id = "", readOnly = false, data, props, references = { search: () => {}, open: () => {} }, shortcuts = [], openEditor = () => {} },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cacheRef = useRef(new Map<string, HTMLCanvasElement>());

  const cacheKey = useMemo(() => {
    try { return JSON.stringify({ elements: data.elements, files: data.files }); } catch { return null; }
  }, [data.elements, data.files]);

  useEffect(() => {
    async function renderPreview() {
      if (!data.elements || !canvasRef.current || !cacheKey) return;
      const cachedCanvas = cacheRef.current.get(cacheKey);
      if (cachedCanvas) { drawToCanvas(cachedCanvas); return; }
      const restoredElements = restoreElements(data.elements as any, null);
      const cnv = await exportToCanvas({ elements: restoredElements as any, appState: { viewBackgroundColor: "#ffffff" }, files: data.files as any });
      cacheRef.current.set(cacheKey, cnv as any);
      drawToCanvas(cnv as any);
    }
    function drawToCanvas(cnv: HTMLCanvasElement) {
      const ctx = canvasRef.current!.getContext("2d"); if (!ctx) return;
      canvasRef.current!.width = cnv.width; canvasRef.current!.height = cnv.height;
      ctx.clearRect(0, 0, cnv.width, cnv.height); ctx.drawImage(cnv, 0, 0);
    }
    renderPreview();
  }, [cacheKey, data.elements, data.files]);

  const handleOpenCanvas = () => openEditor("canvas", {});

  return (
    <div className="flex-grow mx-2">
      <div className="my-2 relative">
        {data.elements ? (
          <div className="h-[400px] border rounded-md overflow-hidden bg-card cursor-pointer flex items-center justify-center" onClick={handleOpenCanvas}>
            <canvas ref={canvasRef} className="max-w-full max-h-full" />
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-md p-8 text-center cursor-pointer" onClick={handleOpenCanvas}>
            <PencilRuler className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Add a canvas</p>
          </div>
        )}
      </div>
      <div className="cursor-text relative">
        <div className="text-xs text-muted-foreground">
          <BaseTextEditor id={id} iText={data.text || ""} iInlineStyles={data.inlineStyles || []} blockType={CanvasBlock as any} placeholder="Type canvas caption text..." references={references} readOnly={readOnly} shortcuts={shortcuts} props={props} ref={ref} />
        </div>
      </div>
    </div>
  );
});

export const CanvasBlock: BlockComponent<CanvasBlockData> = Object.assign(CanvasBlockInner, {
  label: "Canvas",
  icon: "C",
  type: "canvas",
  shortcut: "Cmd+C",
  init: () => ({ text: "", inlineStyles: [], elements: null, files: {} }),
  menuItems: [
    { name: "Edit Canvas", action: (_: any, { openEditor }: any) => openEditor("canvas", {}) },
    { name: "Convert To Image Block", action: async ({ currentBlock }: any, { modifyBlock }: any) => {
        async function exportExcalidrawToDataURL(elements: any[], files: any) {
          if (!elements || elements.length === 0) return null;
          const restoredElements = restoreElements(elements as any, null);
          const cnv = await exportToCanvas({ elements: restoredElements as any, appState: { viewBackgroundColor: "#ffffff" }, files });
          return cnv as HTMLCanvasElement;
        }
        const drawing = await exportExcalidrawToDataURL(currentBlock.data.elements, currentBlock.data.files);
        if (!drawing) return;
        let width = drawing.width; let height = drawing.height; const maxWidth = 1200; const maxHeight = 800;
        if (width > maxWidth || height > maxHeight) { const ratio = Math.min(maxWidth / width, maxHeight / height); width = Math.floor(width * ratio); height = Math.floor(height * ratio); }
        const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "white"; ctx.fillRect(0, 0, width, height); ctx.drawImage(drawing, 0, 0, width, height);
        const optimized = canvas.toDataURL("image/jpeg", 0.7);
        modifyBlock({ ...currentBlock, type: "image", data: { text: currentBlock.text, inlineStyles: currentBlock.inlineStyles, img: optimized } });
      } },
  ],
  followingBlock: "paragraph",
});

export default CanvasBlock;

