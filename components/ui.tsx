import type { CSSProperties, ReactNode } from "react";

export const C = {
  bg: "#f4f7fc",
  card: "#ffffff",
  line: "#e2e8f2",
  lime: "#2563eb",
  green: "#16a34a",
  text: "#0f172a",
  mute: "#64748b",
  red: "#e11d48",
};
export const card: CSSProperties = {
  background: C.card,
  border: `1px solid ${C.line}`,
  borderRadius: 20,
  padding: 18,
  marginBottom: 14,
  boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
};
export const label: CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  color: C.text,
  marginBottom: 8,
};
export const input: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "#f8fafc",
  color: C.text,
  border: `1.5px solid ${C.line}`,
  borderRadius: 12,
  padding: "14px",
  fontSize: 17,
  fontWeight: 600,
};
export const btn: CSSProperties = {
  background: C.lime,
  color: "#ffffff",
  border: "none",
  borderRadius: 12,
  padding: "13px 16px",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
};
export const ghost: CSSProperties = {
  ...btn,
  background: "#ffffff",
  color: C.text,
  border: `1.5px solid ${C.line}`,
  fontWeight: 600,
};
export const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const px = (n: number) => (n >= 10 ? fmt(n, 2) : fmt(n, 4));

export function Tip({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details style={{ marginTop: 8, fontSize: 14, color: C.mute }}>
      <summary style={{ cursor: "pointer", color: C.lime, fontWeight: 600 }}>{title}</summary>
      <div style={{ marginTop: 6, lineHeight: 1.55 }}>{children}</div>
    </details>
  );
}
