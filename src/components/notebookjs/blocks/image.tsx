import React, { forwardRef, useRef } from "react";
import BaseTextEditor from "../components/base-text-editor";
import { ImageIcon } from "lucide-react";
import { useNotebook } from "../context";
import type { BlockComponent, BlockProps, ImageBlockData } from "../types";

const ImageBlockInner = forwardRef<any, BlockProps<ImageBlockData>>(function (
  { id = "", readOnly = false, data, props, references = { search: () => {}, open: () => {} }, shortcuts = [], block = {}, openEditor = () => {} },
  ref,
) {
  const { dispatcher } = useNotebook();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleSelectImg = () => { fileInputRef.current?.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = (event.target?.result || "") as string;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let width = img.width; let height = img.height; const maxWidth = 1200; const maxHeight = 800;
        if (width > maxWidth || height > maxHeight) { const ratio = Math.min(maxWidth / width, maxHeight / height); width = Math.floor(width * ratio); height = Math.floor(height * ratio); }
        const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "white"; ctx.fillRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height);
        const optimizedImageData = canvas.toDataURL("image/jpeg", 0.7);
        dispatcher({ type: "modify-raw-block", block: { ...block, data: { ...block.data, img: optimizedImageData } } });
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
  };
  const handleOpenImg = () => openEditor("image", { handleSelectImg });
  return (
    <div className="flex-grow mx-2">
      <div className="my-2 relative">
        {data.img !== "" ? (
          <img src={data.img} alt={data.text} className="max-w-full rounded-md border border-border cursor-pointer" onClick={handleOpenImg} />
        ) : (
          <div className="border border-dashed border-border rounded-md p-8 text-center cursor-pointer" onClick={handleSelectImg}>
            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Add an image</p>
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>
      <div className="cursor-text relative">
        <div className="text-xs text-muted-foreground">
          <BaseTextEditor id={id} iText={data.text || ""} iInlineStyles={data.inlineStyles || []} blockType={ImageBlock as any} placeholder="Type image caption text..." references={references} readOnly={readOnly} shortcuts={shortcuts} props={props} ref={ref} />
        </div>
      </div>
    </div>
  );
});

export const ImageBlock: BlockComponent<ImageBlockData> = Object.assign(ImageBlockInner, {
  label: "Image",
  icon: "I",
  type: "image",
  shortcut: "Cmd+I",
  init: () => ({ text: "", inlineStyles: [], img: "" }),
  menuItems: [
    { name: "Change Image", action: async ({ blockObj }: any, { modifyBlock }: any) => {
        try {
          // @ts-ignore
          const [fileHandle] = await (window as any).showOpenFilePicker({ types: [{ description: "Image files", accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"] } }], excludeAcceptAllOption: true, multiple: false });
          const file = await fileHandle.getFile();
          const imageData: string = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = (ev) => resolve((ev.target?.result || "") as string); reader.onerror = reject; reader.readAsDataURL(file); });
          const img = new Image(); img.crossOrigin = "anonymous";
          await new Promise((resolve, reject) => { (img.onload as any) = resolve; (img.onerror as any) = reject; img.src = imageData; });
          let width = img.width; let height = img.height; const maxWidth = 1200; const maxHeight = 800;
          if (width > maxWidth || height > maxHeight) { const ratio = Math.min(maxWidth / width, maxHeight / height); width = Math.floor(width * ratio); height = Math.floor(height * ratio); }
          const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "white"; ctx.fillRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL("image/jpeg", 0.7);
          blockObj.data.img = optimized; modifyBlock(blockObj);
        } catch (err: any) { if (err?.name !== "AbortError") console.error("File picker error:", err); }
      } },
  ],
  followingBlock: "paragraph",
});

export default ImageBlock;

