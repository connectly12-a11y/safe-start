"use client";
import { useState } from "react";
import { btn, ghost } from "./ui";

const APP_URL = "https://safe-start-zeta.vercel.app";

export default function ShareButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const full = text.includes(APP_URL) ? text : `${text} ${APP_URL}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(full)}`;

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btn, textDecoration: "none", flex: 1, textAlign: "center" }}
      >
        Share on X
      </a>
      <button style={ghost} onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
