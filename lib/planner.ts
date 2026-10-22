// ESTIMATES ONLY. Replace constants with Strike's real numbers.
export const ASSUMPTIONS = {
  takerFeeRate: 0.0005,
  maintenanceMarginRate: 0.005,
  maxLeverage: 20,
};

export type Side = "long" | "short";

export function plan(opts: {
  capital: number;
  leverage: number;
  entry: number;
  side: Side;
}) {
  const { capital, leverage, entry, side } = opts;
  const { takerFeeRate, maintenanceMarginRate } = ASSUMPTIONS;
  const dir = side === "long" ? 1 : -1;

  const positionSize = capital * leverage;
  const fees = positionSize * takerFeeRate * 2;
  const liquidationPrice =
    entry * (1 - dir * (1 / leverage - maintenanceMarginRate));
  const breakEven = entry * (1 + dir * takerFeeRate * 2);

  const move = (pct: number) => ({
    pct,
    pnl: Math.round((positionSize * dir * pct - fees) * 100) / 100,
  });

  return {
    positionSize,
    fees,
    liquidationPrice,
    breakEven,
    ifPriceMoves: [move(0.05), move(-0.05)],
  };
}
