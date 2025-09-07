import React from "react";

type Props = { icon?: string; className?: string } & Record<string, any>;

export default function Icon({ icon = "", className = "", ...props }: Props) {
  const svg = (Icons as any)[icon];
  if (!svg) return null;
  return React.cloneElement(svg, { className: [svg.props.className, className].filter(Boolean).join(" "), ...props });
}

const Icons: Record<string, JSX.Element> = {
  AddRow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="12" height="15" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="2" />
      <line x1="19" y1="10" x2="19" y2="14" stroke="#27ae60" strokeWidth="2" />
      <line x1="17" y1="12" x2="21" y2="12" stroke="#27ae60" strokeWidth="2" />
    </svg>
  ),
  AddColumn: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="12" height="15" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="7" y1="4" x2="7" y2="19" stroke="currentColor" strokeWidth="2" />
      <line x1="11" y1="4" x2="11" y2="19" stroke="currentColor" strokeWidth="2" />
      <line x1="19" y1="10" x2="19" y2="14" stroke="#27ae60" strokeWidth="2" />
      <line x1="17" y1="12" x2="21" y2="12" stroke="#27ae60" strokeWidth="2" />
    </svg>
  ),
  DeleteRow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="12" height="15" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="2" />
      <line x1="17" y1="12" x2="21" y2="12" stroke="#c0392b" strokeWidth="2" />
    </svg>
  ),
  DeleteColumn: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="12" height="15" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="7" y1="4" x2="7" y2="19" stroke="currentColor" strokeWidth="2" />
      <line x1="11" y1="4" x2="11" y2="19" stroke="currentColor" strokeWidth="2" />
      <line x1="17" y1="12" x2="21" y2="12" stroke="#c0392b" strokeWidth="2" />
    </svg>
  ),
  GroupCells: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="12" height="15" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="4" y="5" width="10" height="13" stroke="none" fill="none" strokeWidth="0" />
    </svg>
  ),
  UngroupCells: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="12" height="15" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="2" />
      <line x1="9" y1="4" x2="9" y2="19" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};
