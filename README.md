# Safe Start

Practice leverage trading safely before you risk real money. Built for the Strike Hackathon.

**Live demo:** https://safe-start-zeta.vercel.app/

## The problem

New traders jump into leverage without feeling how fees and liquidation work. Most learn it by losing real money on their first trade.

## What it does

**Plan table
- Pick a Strike market and see position size, fees, break-even and liquidation price.
- Risk grade (A to F) and a risk meter.
- "What if you traded last week?" card with a 7-day chart and a red liquidation line.
- Share on X / Copy button for the result.

**Practice tab**
- Replay the real last 7 days of a Strike market, one hour at a time, with $1,000 of pretend money.
- Optional stop-loss. Liquidation is checked against each hour's high and low.
- "Why was I liquidated?" lesson with a retry at safer leverage.
- Session stats: win rate, worst loss and average leverage.
- A random-price mode if you want a quick practice round.

**Trade for real:** a button that opens Strike when the user feels ready.

## How Safe Start uses Strike

- Market list and price history come from Strike's public price API (klines).
- Fees use Strike's base taker fee tier (0.05% per side).
- If Strike's API is unreachable, Safe Start falls back to a saved snapshot of real BTC-USD candles.
- It is an onboarding tool: it teaches leverage, fees and liquidation, then sends users to Strike.

## Assumptions

Liquidation uses a simplified maintenance margin (0.50%) and a 20x leverage cap. Strike sets these per market, so real results can differ. All numbers are estimates for learning only. Not financial advice.

## Run it locally

    npm install
    npm run dev

Built with Next.js and TypeScript.

## Roadmap

- Per-market leverage limits and funding rates from Strike
- More practice scenarios (volatile days, crashes)
- Saved progress, lessons and a leaderboard
