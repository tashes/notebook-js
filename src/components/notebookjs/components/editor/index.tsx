import React from "react";
import { useNotebook } from "../../context";

type Props = { current?: string; data?: any; currentBlock?: any; modifyBlock?: (b: any) => void; close?: () => void };

export default function Editor({ current = "", data = {}, currentBlock = {}, modifyBlock = () => {}, close = () => {} }: Props) {
  const { editors } = useNotebook();
  const CurrentEditor = (editors as any[]).find((e) => e.label === current);
  if (!CurrentEditor) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 dark:bg-black/60 flex items-center justify-center">
      <CurrentEditor data={data} currentBlock={currentBlock} modifyBlock={modifyBlock} close={close} />
    </div>
  );
}
