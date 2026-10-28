"use client";

import { useState } from "react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
      className="rounded-full bg-paper px-4 py-2 text-xs font-semibold text-navy hover:bg-sand"
    >
      {copied ? "Copied" : "Copy code"}
    </button>
  );
}
