"use client";
import { useState } from "react";
import Planner from "../components/Planner";
import Simulator from "../components/Simulator";
import { C, btn } from "../components/ui";

export default function Home() {
  const [tab, setTab] = useState<"plan" | "practice">("plan");
  const seg = (on: boolean) =>
    ({
      flex: 1, padding: "12px 0", border: "none", borderRadius: 10, fontSize: 15,
      fontWeight: 700, cursor: "pointer",
      background: on ? "#ffffff" : "transparent",
      color: on ? C.lime : C.mute,
      boxShadow: on ? "0 1px 4px rgba(15,23,42,0.12)" : "none",
    }) as const;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", borderRadius: 24, padding: 22, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, opacity: 0.85 }}>BUILT FOR STRIKE</div>
          <h1 style={{ margin: "6px 0 6px", fontSize: 32 }}>Safe Start</h1>
          <p style={{ margin: 0, lineHeight: 1.5, opacity: 0.95 }}>
            New to leverage? See what a trade could cost you, practice with pretend money, then trade on Strike when you feel ready.
          </p>
        </div>

        <div style={{ display: "flex", gap: 4, maxWidth: 420, background: "#e6ebf5", padding: 4, borderRadius: 14, marginBottom: 16 }}>
          <button style={seg(tab === "plan")} onClick={() => setTab("plan")}>1. Plan</button>
          <button style={seg(tab === "practice")} onClick={() => setTab("practice")}>2. Practice</button>
        </div>

        {tab === "plan" ? <Planner /> : <Simulator />}

        <a href="http://strikefinance.org/" target="_blank" rel="noopener noreferrer"
           style={{ ...btn, display: "block", textAlign: "center", textDecoration: "none", margin: "8px auto 0", maxWidth: 420, padding: 16, fontSize: 17 }}>
          Ready? Trade on Strike
        </a>
        <p style={{ color: C.mute, fontSize: 12, textAlign: "center", lineHeight: 1.5 }}>
          Estimates for learning only. Not financial advice.
        </p>
      </div>
    </div>
  );
}
