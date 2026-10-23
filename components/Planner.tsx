"use client";
import { useEffect, useState } from "react";
import { plan, ASSUMPTIONS, Side } from "../lib/planner";
import { getSymbols, getPrice, getCandles, Candle } from "../lib/strike";
import RiskMeter from "./RiskMeter";
import CandleChart from "./CandleChart";
import ShareButton from "./ShareButton";
import { C, card, label, input, btn, ghost, fmt, px, Tip } from "./ui";

const Row = ({ k, v }: { k: string; v: string }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
    <span style={{ color: C.mute }}>{k}</span>
    <b>{v}</b>
  </div>
);

function grade(room: number): [string, string] {
  if (room >= 25) return ["A", C.green];
  if (room >= 15) return ["B", C.green];
  if (room >= 8) return ["C", "#f59e0b"];
  if (room >= 4) return ["D", "#f97316"];
  return ["F", C.red];
}

function swing(cs: Candle[]) {
  let hi = -Infinity, lo = Infinity, drop = 0, rise = 0;
  for (const c of cs) {
    hi = Math.max(hi, c.h);
    lo = Math.min(lo, c.l);
    drop = Math.max(drop, (hi - c.l) / hi);
    rise = Math.max(rise, (c.h - lo) / lo);
  }
  return { drop: drop * 100, rise: rise * 100 };
}

export default function Planner() {
  const [capital, setCapital] = useState("1000");
  const [leverage, setLeverage] = useState("5");
  const [entry, setEntry] = useState("0.50");
  const [side, setSide] = useState<Side>("long");
  const [symbols, setSymbols] = useState<string[]>([]);
  const [sym, setSym] = useState("");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    getSymbols()
      .then((s) => {
        if (s.length) { setSymbols(s); setSym(s.includes("BTC-USD") ? "BTC-USD" : s[0]); }
        else setNote("Live Strike data unavailable. Type a price instead.");
      })
      .catch(() => setNote("Live Strike data unavailable. Type a price instead."));
  }, []);

  const load = async () => {
    setNote("Loading live Strike data...");
    try {
      const [p, cs] = await Promise.all([getPrice(sym), getCandles(sym)]);
      if (p > 0) setEntry(String(p));
      setCandles(cs);
      setNote(`Live Strike data loaded for ${sym}.`);
    } catch {
      setNote("Couldn't load live data. Type a price instead.");
    }
  };

  const cap = Number(capital);
  const lev = Number(leverage);
  const ent = Number(entry);
  const valid = cap > 0 && ent > 0 && lev >= 1 && lev <= ASSUMPTIONS.maxLeverage;
  const r = valid ? plan({ capital: cap, leverage: lev, entry: ent, side }) : null;
  const room = r ? (Math.abs(ent - r.liquidationPrice) / ent) * 100 : 0;
  const [g, gColor] = grade(room);
  const sw = candles.length > 1 ? swing(candles) : null;
  const against = sw ? (side === "long" ? sw.drop : sw.rise) : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, alignItems: "start" }}>
      <div>
        <div style={card}>
          <label style={label}>Market (live from Strike)</label>
          {symbols.length > 0 ? (
            <div style={{ display: "flex", gap: 8 }}>
              <select value={sym} onChange={(e) => setSym(e.target.value)}
                style={{ ...input, flex: 1, padding: 12 }}>
                {symbols.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button style={btn} onClick={load}>Load</button>
            </div>
          ) : null}
          <div style={{ fontSize: 13, color: C.mute, marginTop: 6 }}>{note}</div>
          <div style={{ height: 14 }} />
          <label style={label}>Your money (USD)</label>
          <input style={input} inputMode="decimal" value={capital} onChange={(e) => setCapital(e.target.value)} />
          <div style={{ height: 14 }} />
          <label style={label}>Leverage: {leverage}x</label>
          <input type="range" min={1} max={ASSUMPTIONS.maxLeverage} step={1}
            value={lev || 1} onChange={(e) => setLeverage(e.target.value)} style={{ width: "100%" }} />
          <Tip title="What's leverage?">
            Leverage borrows extra buying power. At 5x, $1,000 controls a $5,000 position. Wins and losses are both 5x bigger, so there is less room before the trade closes itself.
          </Tip>
          <div style={{ height: 14 }} />
          <label style={label}>Entry price (USD)</label>
          <input style={input} inputMode="decimal" value={entry} onChange={(e) => setEntry(e.target.value)} />
          <div style={{ height: 14 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...(side === "long" ? btn : ghost), flex: 1 }} onClick={() => setSide("long")}>Long (up)</button>
            <button style={{ ...(side === "short" ? btn : ghost), flex: 1 }} onClick={() => setSide("short")}>Short (down)</button>
          </div>
        </div>
      </div>

      <div>
        {!r && (
          <div style={card}>
            Enter an amount above 0, a price above 0, and leverage between 1 and {ASSUMPTIONS.maxLeverage} to see your plan.
          </div>
        )}

        {r && (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.lime }}>YOUR PLAN (ESTIMATE)</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: C.mute }}>Risk grade</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: gColor, lineHeight: 1 }}>{g}</div>
              </div>
            </div>
            <RiskMeter room={room} />
            <Row k="Position size" v={`$${fmt(r.positionSize, 0)}`} />
            <Row k="Fees (open + close)" v={`$${fmt(r.fees)}`} />
            <Row k="Break-even price" v={`$${px(r.breakEven)}`} />
            <Row k="Liquidation price" v={`$${px(r.liquidationPrice)}`} />
            <Row k="If price moves +5%" v={`${r.ifPriceMoves[0].pnl >= 0 ? "+" : "-"}$${fmt(Math.abs(r.ifPriceMoves[0].pnl))}`} />
            <Row k="If price moves -5%" v={`${r.ifPriceMoves[1].pnl >= 0 ? "+" : "-"}$${fmt(Math.abs(r.ifPriceMoves[1].pnl))}`} />
            <p style={{ lineHeight: 1.5 }}>
              {room < 10
                ? `Heads up: a ${fmt(room, 1)}% move against you closes this trade. Lower leverage gives it more room to breathe.`
                : `Nice: the price has to move ${fmt(room, 1)}% against you before this trade closes.`}
            </p>
            <Tip title="What's liquidation?">
              If a trade loses almost all of your money, the exchange closes it automatically. That price is the liquidation price.
            </Tip>
            <Tip title="What are taker fees?">
              A fee charged when you take an order that fills right away. We count it twice: once to open, once to close.
            </Tip>
          </div>
        )}

        {r && sw && (
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.lime, marginBottom: 6 }}>WHAT IF YOU TRADED LAST WEEK?</div>
            <p style={{ margin: 0, lineHeight: 1.55 }}>
              On Strike, {sym} swung <b>{fmt(against, 1)}%</b> against {side === "long" ? "longs" : "shorts"} at its worst point in the last 7 days. Your cushion is <b>{fmt(room, 1)}%</b>.{" "}
              {against >= room
                ? "A trade opened at the wrong moment would have been liquidated. Try lowering leverage."
                : "This setup would have survived even the worst swing."}
            </p>
            <CandleChart candles={candles} liq={r.liquidationPrice} entry={ent} />
            <ShareButton text={`At ${lev}x on ${sym}, the worst ${side === "long" ? "dip" : "spike"} on Strike last week went ${fmt(against, 1)}% against me and my cushion was ${fmt(room, 1)}%. ${against >= room ? "I would have been liquidated." : "I would have survived."} Estimate from past results, not a forecast. Test your own with Safe Start:`} />
          </div>
        )}
      </div>

      <div style={{ ...card, gridColumn: "1 / -1", fontSize: 13, color: C.mute, lineHeight: 1.5 }}>
        <b style={{ color: C.text }}>Assumptions (estimates):</b> taker fee {fmt(ASSUMPTIONS.takerFeeRate * 100, 2)}% per side (Strike's base tier, from its docs). Maintenance margin {fmt(ASSUMPTIONS.maintenanceMarginRate * 100, 2)}% and the {ASSUMPTIONS.maxLeverage}x cap are simplified. Strike sets these per market using margin tiers, so real results can differ.
      </div>
    </div>
  );
}
