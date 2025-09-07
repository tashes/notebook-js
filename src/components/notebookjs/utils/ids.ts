export function generateId(): string {
  const bytes = new Uint8Array(12); // 12 bytes = 24 hex chars
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateBlockId(): string {
  const chars = "0123456789abcdefABCDEF_";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
