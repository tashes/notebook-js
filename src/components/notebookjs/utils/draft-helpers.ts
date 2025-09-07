// Function to convert Draft.js inline styles to our application format
export function convertFromDraftToInlineStyles(rawInlineStyles: Array<{ offset: number; length: number; style: string }>) {
  return rawInlineStyles.map((style) => ({
    offset: style.offset,
    length: style.length,
    style: style.style,
  }));
}

// Helper function to get the current selection bounds
export function getSelectionBounds(): {
  top: number; left: number; width: number; height: number; bottom: number;
} | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const bounds = range.getBoundingClientRect();
  if (bounds.width === 0 && bounds.height === 0) return null;
  return { top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height, bottom: bounds.bottom };
}

export function isCmdOS(): boolean {
  return navigator.platform === "MacIntel";
}

export function deepEquals(...items: any[]): boolean {
  const equal = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (a && b && typeof a === "object" && typeof b === "object") {
      if ((a as any).constructor !== (b as any).constructor) return false;
      let length: number, i: any, keys: string[];
      if (Array.isArray(a)) {
        length = a.length;
        if (length !== b.length) return false;
        for (i = length; i-- !== 0;) if (!equal(a[i], b[i])) return false;
        return true;
      }
      if (a instanceof Map && b instanceof Map) {
        if (a.size !== b.size) return false;
        for (i of a.entries()) if (!b.has(i[0])) return false;
        for (i of a.entries()) if (!equal(i[1], b.get(i[0]))) return false;
        return true;
      }
      if (a instanceof Set && b instanceof Set) {
        if (a.size !== b.size) return false;
        for (i of a.entries()) if (!b.has(i[0])) return false;
        return true;
      }
      if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
        length = (a as any).length;
        if (length !== (b as any).length) return false;
        for (i = length; i-- !== 0;) if ((a as any)[i] !== (b as any)[i]) return false;
        return true;
      }
      if ((a as any).constructor === RegExp) return a.source === b.source && a.flags === b.flags;
      if ((a as any).valueOf !== Object.prototype.valueOf) return (a as any).valueOf() === (b as any).valueOf();
      if ((a as any).toString !== Object.prototype.toString) return (a as any).toString() === (b as any).toString();
      keys = Object.keys(a);
      length = keys.length;
      if (length !== Object.keys(b).length) return false;
      for (i = length; i-- !== 0;) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
      for (i = length; i-- !== 0;) {
        const key = keys[i];
        if (key === "_owner" && (a as any).$$typeof) continue;
        if (!equal(a[key], (b as any)[key])) return false;
      }
      return true;
    }
    return a !== a && b !== b;
  };
  if (items.length === 0) return false;
  const first = items[0];
  for (let i = 1; i < items.length; i++) if (!equal(first, items[i])) return false;
  return true;
}

