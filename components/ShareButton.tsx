"use client";
import { useState } from "react";
import { btn, ghost } from "./ui";

export default function ShareButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  const href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <a href={href} target="_blank" rel="noopener noreferrer"
        style={{ ...btn, textDecoration: "none", flex: 1, textAlign: "center" }}>Share on X</a>
      <button style={ghost} onClick={copy}>{copied ? "Copied" : "Copy"}</button>
    </div>
  );
}
