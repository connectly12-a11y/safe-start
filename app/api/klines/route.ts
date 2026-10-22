import snapshot from "../../../data/btc-1h.json";

const BASE = "https://api.strikefinance.org/price/v2";
type Row = (string | number)[];

async function live(url: string): Promise<Row[] | null> {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(6000) });
      const rows = await r.json();
      if (Array.isArray(rows) && rows.length > 1) return rows as Row[];
    } catch {}
    await new Promise((res) => setTimeout(res, 400));
  }
  return null;
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const symbol = sp.get("symbol");
  if (!symbol) return Response.json({ error: "symbol required" }, { status: 400 });
  const interval = sp.get("interval") ?? "1h";
  const limit = sp.get("limit") ?? "168";
  const url = `${BASE}/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`;

  let rows = await live(url);
  let cached = false;
  if (!rows && symbol === "BTC-USD" && interval === "1h" && Array.isArray(snapshot) && snapshot.length > 1) {
    rows = snapshot as unknown as Row[];
    cached = true;
  }
  if (!rows) return Response.json({ error: "unavailable" }, { status: 502 });

  const candles = rows.map((x) => ({
    t: Number(x[0]), o: Number(x[1]), h: Number(x[2]), l: Number(x[3]), c: Number(x[4]),
  }));
  return Response.json({ candles, cached });
}
