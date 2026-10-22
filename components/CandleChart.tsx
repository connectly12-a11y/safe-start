import { C, px } from "./ui";
import type { Candle } from "../lib/strike";

export default function CandleChart({ candles, liq, entry }: { candles: Candle[]; liq: number; entry: number }) {
  if (candles.length < 2) return null;
  const W = 320, H = 150;
  const lo = Math.min(...candles.map((c) => c.l), Math.max(liq, 0));
  const hi = Math.max(...candles.map((c) => c.h), liq, entry);
  const y = (v: number) => 10 + (1 - (v - lo) / (hi - lo || 1)) * (H - 20);
  const x = (i: number) => (i / (candles.length - 1)) * W;
  const pts = candles.map((c, i) => `${x(i)},${y(c.c)}`).join(" ");
  return (
    <div style={{ marginTop: 12 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "#f8fafc", borderRadius: 12 }}>
        <polyline points={pts} fill="none" stroke={C.lime} strokeWidth="1.8" />
        <line x1="0" x2={W} y1={y(entry)} y2={y(entry)} stroke={C.mute} strokeDasharray="4 4" />
        <line x1="0" x2={W} y1={y(liq)} y2={y(liq)} stroke={C.red} strokeWidth="1.5" />
        <text x="4" y={y(liq) - 4} fontSize="9" fill={C.red}>Liquidation ${px(liq)}</text>
      </svg>
      <div style={{ fontSize: 12, color: C.mute, marginTop: 4 }}>
        Last 7 days (hourly). Blue is price, dashed is your entry, red is where you would be liquidated.
      </div>
    </div>
  );
}
