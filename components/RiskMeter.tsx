import { C, fmt } from "./ui";

export default function RiskMeter({ room }: { room: number }) {
  const pct = (Math.min(room, 50) / 50) * 100;
  const color = room < 5 ? C.red : room < 15 ? "#f59e0b" : C.green;
  const word = room < 5 ? "Very risky" : room < 15 ? "Risky" : "More breathing room";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
        <b style={{ color }}>{word}</b>
        <span style={{ color: C.mute }}>{fmt(room, 1)}% until liquidation</span>
      </div>
      <div style={{ height: 10, borderRadius: 99, background: C.line }}>
        <div style={{ width: `${Math.max(pct, 4)}%`, height: 10, borderRadius: 99, background: color }} />
      </div>
    </div>
  );
}
