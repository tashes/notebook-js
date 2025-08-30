// This file is resolved when imported in a React Server Component (Next.js).
// It intentionally throws to guide users to the client-only entry.
throw new Error(
  "@tamatashwin/notebook-js is client-only. Import from '@tamatashwin/notebook-js/client' inside a 'use client' file."
);
