export type Candle = { t: number; o: number; h: number; l: number; c: number };

const FALLBACK = ["BTC-USD"];

export async function getSymbols(): Promise<string[]> {
  try {
    const j = await (await fetch("/api/price")).json();
    if (Array.isArray(j.symbols) && j.symbols.length) return j.symbols;
  } catch {}
  return FALLBACK;
}

export async function getCandles(symbol: string, interval = "1h", limit = 168): Promise<Candle[]> {
  const j = await (await fetch(`/api/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`)).json();
  return j.candles ?? [];
}

export async function getPrice(symbol: string): Promise<number> {
  try {
    const j = await (await fetch(`/api/price?symbol=${encodeURIComponent(symbol)}`)).json();
    const p = Number(j.price);
    if (p > 0) return p;
  } catch {}
  const cs = await getCandles(symbol, "1m", 2);
  return cs.length ? cs[cs.length - 1].c : 0;
}
