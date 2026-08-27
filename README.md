# ChainTrack — BEP-20 & TRC-20 Token Transaction Tracker

ChainTrack is a production-ready, dark-themed crypto analytics dashboard for tracking the latest **3 token transfers** of any wallet address on **BNB Smart Chain (BEP-20)** and **TRON (TRC-20)**.

---

## Features

- **Multi-Chain Token Transfer Tracking**:
  - **BEP-20**: Fetches real token transfers on BNB Smart Chain via BscScan / Etherscan V2 / RPC endpoints.
  - **TRC-20**: Fetches real TRC-20 token transfers on the TRON network via TronGrid and TronScan APIs.
- **Strict Latest 3 Scope**: Retrieves, filters, and formats exactly the latest 3 token transfers with precise timestamps, rank badges (`#1 Latest`, `#2`, `#3`), amount calculations with token decimals, token symbols, and sender/receiver indicators (`SENT` vs `RECEIVED`).
- **Dynamic Address Validation**: Validates EVM addresses (`0x...`, 42 characters) and TRON addresses (`T...`, 34 characters) with clean inline error banners.
- **Copy & Explorer Integration**: 1-click clipboard copy with `Copied ✓` micro-interaction on addresses and transaction hashes, plus direct deep-links to BscScan and TronScan explorers.
- **Clipboard Paste**: Built-in Paste button with permission handling.
- **Local Search History**: Saves the last 5 searched addresses locally in browser `localStorage` for instant 1-click retrieval.
- **Secure Server-Side Proxy**: All blockchain queries run through backend Express endpoints (`/api/transactions`, `/api/health`). No API keys or credentials are ever exposed in client JavaScript.
- **Mobile-First Responsive Design**: Full touch-friendly layout, clean typography, glassmorphism cards, and zero horizontal scrolling.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js, Express, Vite middleware.
- **Bundler & Build Tool**: Vite, `esbuild`, `tsx`.

---

## Environment Variables

Configure environment variables in `.env` (refer to `.env.example`):

```env
# Optional/Recommended API key for BscScan / Etherscan V2 queries (get free at https://bscscan.com/myapikey)
BSCSCAN_API_KEY=""

# Optional API key for TronGrid queries (https://www.trongrid.io)
TRONGRID_API_KEY=""

# Platform injection (optional)
APP_URL=""
GEMINI_API_KEY=""
```

---

## Installation & Setup

1. **Clone or navigate to the project repository**:
   ```bash
   npm install
   ```

2. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
   The application starts on `http://localhost:3000`.

3. **Build for Production**:
   ```bash
   npm run build
   ```
   This builds the React frontend with Vite into `dist/` and bundles `server.ts` into `dist/server.cjs` using `esbuild`.

4. **Start Production Server**:
   ```bash
   npm start
   ```

---

## How BEP-20 Tracking Works

1. When a user queries a BEP-20 address, the server validates the 42-character hexadecimal format (`0x...`).
2. The server queries the BscScan / Etherscan API token transfer events endpoint (`tokentx` action) for chain ID `56`.
3. The response is sorted in descending chronological order.
4. The server normalizes raw transfer amounts using the token's decimal precision (e.g. 18 for BNB/BUSD, 6 or 18 for USDT).
5. It identifies whether the queried address is the sender or the receiver and returns the 3 most recent token transfers with explorer links to `https://bscscan.com/tx/<hash>`.

---

## How TRC-20 Tracking Works

1. When a user queries a TRC-20 address, the server validates the 34-character base58 format (`T...`).
2. The backend queries TronGrid's `/v1/accounts/<address>/transactions/trc20` endpoint (with fallback to TronScan's `/api/token_trc20/transfers` endpoint).
3. The response is parsed to extract token metadata (symbol, name, decimals), transferred amount, block timestamp, sender, and receiver.
4. Direction is calculated relative to the queried address (`SENT` vs `RECEIVED`).
5. Returns exactly the latest 3 transfers with explorer links to `https://tronscan.org/#/transaction/<hash>`.

---

## Deployment Instructions

To deploy to Cloud Run or any Node.js container hosting:
1. Run `npm run build`.
2. Ensure container sets `NODE_ENV=production`.
3. Start the container with `npm start` (which runs `node dist/server.cjs` listening on port `3000`).
