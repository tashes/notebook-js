import React, { createContext, useContext } from "react";

type NotebookCtx = {
  blocks: any[];
  tools: any[];
  editors: any[];
  menuItems: any[];
  dispatcher: (action: any) => void;
  editorFns: any;
  refsMap: Map<string, React.RefObject<any>>;
};

const Ctx = createContext<NotebookCtx | null>(null);

export function NotebookProvider({ value, children }: { value: NotebookCtx; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotebook() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotebook must be used within NotebookProvider");
  return ctx;
}

