const BASE = "https://api.strikefinance.org/price/v2";

export async function GET(req: Request) {
  const symbol = new URL(req.url).searchParams.get("symbol");
  try {
    if (!symbol) {
      const j = await (await fetch(`${BASE}/exchangeInfo`, { cache: "no-store" })).json();
      return Response.json({ symbols: (j.symbols ?? []).map((s: { symbol: string }) => s.symbol) });
    }
    const j = await (await fetch(`${BASE}/ticker/price?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" })).json();
    return Response.json({ price: Number(j.price) });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
