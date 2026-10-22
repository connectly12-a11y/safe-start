# Safe Start

A beginner-friendly learning tool for leveraged perpetuals trading, built for the Strike Hackathon.

## The problem
New traders jump into leverage without feeling how fees and liquidation work.

## What it does
1. **Plan**: enter your money, leverage, entry price and direction. See position size, fees, break-even, liquidation price and a +/-5% move, all labeled as estimates.
2. **Practice**: open and close pretend trades with $1,000 of practice money on a simulated price, and see liquidation happen safely.
3. **Trade for real**: a button that opens Strike.

## How Safe Start uses Strike
Safe Start is an onboarding tool for Strike's perpetual futures. It teaches the concepts (leverage, taker fees, liquidation) and sends users to Strike. The fee and margin numbers are placeholders being verified against Strike's docs. The practice price is simulated, not live Strike data.

## Run it
    npm install
    npm run dev

## Roadmap
Real Strike fee and margin numbers, live prices, lessons, leaderboard.
