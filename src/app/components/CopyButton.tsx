"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for non-secure contexts
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      aria-label={copied ? "Copied" : "Copy command"}
      className={`flex items-center justify-center transition-colors ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5" style={{ color: "oklch(0.55 0.15 155)" }} />
      ) : (
        <Copy className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
      )}
    </button>
  );
}
