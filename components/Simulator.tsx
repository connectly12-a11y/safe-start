"use client";
import { useEffect, useState } from "react";
import { plan, ASSUMPTIONS, Side } from "../lib/planner";
import { getSymbols, getCandles, Candle } from "../lib/strike";
import { C, card, label, input, btn, ghost, fmt, px, Tip } from "./ui";

type Pos = { side: Side; margin: number; leverage: number; entry: number; size: number; fees: number; liq: number; stop: number | null };
type Trade = { lev: number; pnl: number; liq: boolean };
const START = 100;
const MID = 24;
const pnlAt = (p: Pos, at: number) => (p.side === "long" ? 1 : -1) * p.size * (at / p.entry - 1) - p.fees;

export default function Simulator() {
  const [balance, setBalance] = useState(1000);
  const [price, setPrice] = useState(START);
  const [hist, setHist] = useState<number[]>([START]);
  const [pos, setPos] = useState<Pos | null>(null);
  const [side, setSide] = useState<Side>("long");
  const [lev, setLev] = useState("5");
  const [margin, setMargin] = useState("200");
  const [stop, setStop] = useState("");
  const [auto, setAuto] = useState(false);
  const [n, setN] = useState(0);
  const [msg, setMsg] = useState("Load real Strike history to replay last week, or open a trade on the random practice price.");
  const [symbols, setSymbols] = useState<string[]>([]);
  const [sym, setSym] = useState("");
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [lesson, setLesson] = useState<{ lev: number; safe: number; cushion: number } | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    getSymbols().then((s) => {
      if (s.length) { setSymbols(s); setSym(s.includes("BTC-USD") ? "BTC-USD" : s[0]); }
    }).catch(() => {});
  }, []);

  const loadReplay = async () => {
    setMsg("Loading real Strike price history...");
    try {
      const cs = await getCandles(sym);
      if (cs.length < 2) throw new Error("no data");
      const s = Math.min(MID, cs.length - 1);
      setCandles(cs); setIdx(s); setPrice(cs[s].c);
      setHist(cs.slice(0, s + 1).map((x) => x.c));
      setPos(null); setAuto(false); setBalance(1000); setLesson(null);
      setMsg(`Replaying the last 7 days of ${sym} on Strike. Open a trade, then press Next hour.`);
    } catch {
      setMsg("Couldn't load Strike history. You can still use the random practice price.");
    }
  };

  const useRandom = () => {
    setCandles(null); setPrice(START); setHist([START]); setPos(null); setAuto(false); setLesson(null);
    setMsg("Back to the random practice price.");
  };

  const liquidate = (p: Pos) => {
    setLesson({
      lev: p.leverage,
      safe: Math.max(1, Math.floor(p.leverage / 2)),
      cushion: 100 / p.leverage - ASSUMPTIONS.maintenanceMarginRate * 100,
    });
    setTrades((t) => [...t, { lev: p.leverage, pnl: -p.margin, liq: true }]);
    setPos(null); setAuto(false);
    setMsg("Your practice trade was liquidated. That's how leverage works, and it's why we practice here first.");
  };

  const finish = (p: Pos, at: number, prefix: string, extra = "") => {
    const v = pnlAt(p, at);
    setBalance((b) => b + Math.max(0, p.margin + v));
    setTrades((t) => [...t, { lev: p.leverage, pnl: v, liq: false }]);
    setMsg(`${prefix} ${v >= 0 ? "+" : "-"}$${fmt(Math.abs(v))} (estimate, after fees).${extra}`);
    setPos(null); setAuto(false);
  };

  const check = (p: Pos, low: number, high: number) => {
    const long = p.side === "long";
    if (p.stop !== null && (long ? low <= p.stop : high >= p.stop)) {
      finish(p, p.stop, "Your stop-loss triggered. Result:", ` Your loss was capped. Without a stop, this trade risked up to $${fmt(p.margin)}.`);
    } else if (long ? low <= p.liq : high >= p.liq) {
      liquidate(p);
    }
  };

  const step = () => {
    if (candles) {
      if (idx >= candles.length - 1) {
        setAuto(false);
        setMsg("You reached the end of the replay. Close your trade or load another market.");
        return;
      }
      const k = idx + 1;
      const c = candles[k];
      setIdx(k); setPrice(c.c); setN((x) => x + 1);
      setHist(candles.slice(0, k + 1).map((x) => x.c).slice(-60));
      if (pos) check(pos, c.l, c.h);
    } else {
      const next = price * (1 + (Math.random() - 0.5) * 0.06);
      setPrice(next); setN((x) => x + 1);
      setHist((h) => [...h.slice(-59), next]);
      if (pos) check(pos, next, next);
    }
  };

  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(step, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, n, pos]);

  const open = () => {
    const L = Number(lev);
    const M = Number(margin);
    if (!(L >= 1 && L <= ASSUMPTIONS.maxLeverage)) return setMsg(`Choose leverage between 1 and ${ASSUMPTIONS.maxLeverage}.`);
    if (!(M > 0 && M <= balance)) return setMsg("Choose an amount above 0 that fits in your practice balance.");
    const p = plan({ capital: M, leverage: L, entry: price, side });
    let stopPrice: number | null = null;
    if (stop.trim() !== "") {
      const s = Number(stop);
      if (!(s > 0 && s < 100)) return setMsg("Stop-loss must be a percent between 0 and 100, or leave it blank.");
      stopPrice = side === "long" ? price * (1 - s / 100) : price * (1 + s / 100);
      const ok = side === "long" ? stopPrice > p.liquidationPrice : stopPrice < p.liquidationPrice;
      if (!ok) return setMsg("That stop is beyond your liquidation price, so it could never trigger. Use a smaller percent.");
    }
    setBalance((b) => b - M);
    setLesson(null);
    setPos({ side, margin: M, leverage: L, entry: price, size: p.positionSize, fees: p.fees, liq: p.liquidationPrice, stop: stopPrice });
    setMsg("Trade open. Press Next, or Auto, to move the price.");
  };

  const pnl = pos ? pnlAt(pos, price) : 0;

  const reset = () => {
    setBalance(1000); setPos(null); setAuto(false); setLesson(null); setTrades([]);
    if (candles) {
      const s = Math.min(MID, candles.length - 1);
      setIdx(s); setPrice(candles[s].c); setHist(candles.slice(0, s + 1).map((x) => x.c));
    } else { setPrice(START); setHist([START]); }
    setMsg("Fresh start with $1,000 of practice money.");
  };

  const lo = Math.min(...hist);
  const hi = Math.max(...hist);
  const pts = hist.map((v, i) => `${(i / Math.max(hist.length - 1, 1)) * 300},${80 - ((v - lo) / (hi - lo || 1)) * 70 - 5}`).join(" ");

  const wins = trades.filter((t) => t.pnl > 0).length;
  const worst = trades.length ? Math.min(...trades.map((t) => t.pnl)) : 0;
  const avgLev = trades.length ? trades.reduce((a, t) => a + t.lev, 0) / trades.length : 0;
  const hiLev = trades.filter((t) => t.lev >= 10).length;
  const liqs = trades.filter((t) => t.liq).length;
  const Stat = ({ k, v }: { k: string; v: string }) => (
    <div style={{ flex: 1, minWidth: 90 }}>
      <div style={{ fontSize: 12, color: C.mute }}>{k}</div>
      <b style={{ fontSize: 18 }}>{v}</b>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, alignItems: "start" }}>
      <div>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div><div style={{ fontSize: 12, color: C.mute }}>Practice balance</div><b style={{ fontSize: 24 }}>${fmt(balance)}</b></div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: C.mute }}>{candles ? `${sym} (Strike replay)` : "Random practice price"}</div>
              <b style={{ fontSize: 24, color: C.lime }}>${px(price)}</b>
            </div>
          </div>
          <svg viewBox="0 0 300 80" style={{ width: "100%", marginTop: 10 }}>
            <polyline points={pts} fill="none" stroke={C.lime} strokeWidth="2" />
          </svg>
          <div style={{ fontSize: 12, color: C.mute }}>
            {candles ? `Real Strike hourly prices. Hour ${idx + 1} of ${candles.length}.` : "Simulated random price, not live Strike data."}
          </div>
        </div>

        <div style={card}>
          <label style={label}>Replay real Strike history</label>
          {symbols.length > 0 ? (
            <div style={{ display: "flex", gap: 8 }}>
              <select value={sym} onChange={(e) => setSym(e.target.value)} style={{ ...input, flex: 1, padding: 12 }}>
                {symbols.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button style={btn} onClick={loadReplay}>Replay</button>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: C.mute }}>Strike data unavailable right now.</div>
          )}
          {candles && <button style={{ ...ghost, width: "100%", marginTop: 10 }} onClick={useRandom}>Use random price instead</button>}
        </div>

        {trades.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.lime, marginBottom: 10 }}>YOUR PRACTICE STATS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Stat k="Trades" v={String(trades.length)} />
              <Stat k="Win rate" v={`${fmt((wins / trades.length) * 100, 0)}%`} />
              <Stat k="Worst loss" v={`-$${fmt(Math.abs(Math.min(worst, 0)))}`} />
              <Stat k="Avg leverage" v={`${fmt(avgLev, 1)}x`} />
            </div>
            <p style={{ margin: "12px 0 0", lineHeight: 1.5, fontSize: 14 }}>
              {liqs > 0
                ? `You were liquidated ${liqs} time${liqs > 1 ? "s" : ""}. Lower leverage or a stop-loss would have protected you.`
                : hiLev > trades.length / 2
                ? `You used 10x or more on ${hiLev} of ${trades.length} trades. High leverage is where most beginners get hurt.`
                : "Nice. You are keeping leverage reasonable. Keep practicing before using real money."}
            </p>
          </div>
        )}
      </div>

      <div>
        {!pos && (
          <div style={card}>
            <label style={label}>Amount to risk (USD)</label>
            <input style={input} inputMode="decimal" value={margin} onChange={(e) => setMargin(e.target.value)} />
            <div style={{ height: 14 }} />
            <label style={label}>Leverage: {lev}x</label>
            <input type="range" min={1} max={ASSUMPTIONS.maxLeverage} value={Number(lev) || 1} onChange={(e) => setLev(e.target.value)} style={{ width: "100%" }} />
            <div style={{ height: 14 }} />
            <label style={label}>Stop-loss: % move against you (optional)</label>
            <input style={input} inputMode="decimal" placeholder="e.g. 3 (leave blank for none)" value={stop} onChange={(e) => setStop(e.target.value)} />
            <Tip title="What's a stop-loss?">
              A stop-loss closes your trade automatically at a loss you choose, before liquidation can wipe you out. It caps how much one bad trade can cost.
            </Tip>
            <div style={{ height: 14 }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button style={{ ...(side === "long" ? btn : ghost), flex: 1 }} onClick={() => setSide("long")}>Long</button>
              <button style={{ ...(side === "short" ? btn : ghost), flex: 1 }} onClick={() => setSide("short")}>Short</button>
            </div>
            <button style={{ ...btn, width: "100%" }} onClick={open}>Open practice trade</button>
          </div>
        )}

        {pos && (
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.lime }}>OPEN: {pos.side.toUpperCase()} {pos.leverage}x</div>
            <p style={{ margin: "8px 0" }}>
              Entry ${px(pos.entry)} | Liquidation ${px(pos.liq)} | {pos.stop !== null ? `Stop $${px(pos.stop)}` : "No stop-loss"}
            </p>
            <b style={{ fontSize: 28, color: pnl >= 0 ? C.green : C.red }}>{pnl >= 0 ? "+" : "-"}${fmt(Math.abs(pnl))}</b>
            <span style={{ color: C.mute, fontSize: 13 }}> estimated profit/loss</span>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <button style={ghost} onClick={step}>{candles ? "Next hour" : "Next tick"}</button>
              <button style={auto ? btn : ghost} onClick={() => setAuto(!auto)}>{auto ? "Stop auto" : "Auto"}</button>
              <button style={btn} onClick={() => finish(pos, price, pnl >= 0 ? "Nice trade! You closed with about" : "Closed at about")}>Close trade</button>
            </div>
          </div>
        )}

        {lesson && !pos && (
          <div style={{ ...card, borderColor: C.red }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 6 }}>WHY YOU WERE LIQUIDATED</div>
            <p style={{ margin: "0 0 10px", lineHeight: 1.55 }}>
              At {lesson.lev}x, a move of only about <b>{fmt(lesson.cushion, 1)}%</b> against you wipes out your margin. At <b>{lesson.safe}x</b> you would have a cushion of about <b>{fmt(100 / lesson.safe - ASSUMPTIONS.maintenanceMarginRate * 100, 1)}%</b>. A stop-loss would also have capped the loss.
            </p>
            <button style={{ ...btn, width: "100%" }} onClick={() => { setLev(String(lesson.safe)); setLesson(null); }}>
              Retry at {lesson.safe}x
            </button>
          </div>
        )}

        <div style={{ ...card, lineHeight: 1.5 }}>{msg}</div>
        <button style={{ ...ghost, width: "100%" }} onClick={reset}>Reset practice account</button>
        <Tip title="How does practice work?">
          With Strike replay, you trade through the real last 7 days of a market, one hour at a time. Stop-loss and liquidation are checked against each hour's high and low. Fees and liquidation use the same estimate formula as the Planner.
        </Tip>
      </div>
    </div>
  );
}
