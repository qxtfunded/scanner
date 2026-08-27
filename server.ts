import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for recent lookups (30s TTL)
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();

function getCached(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any, ttlSeconds: number = 20) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Address format validators
 */
function isValidBep20Address(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr.trim());
}

function isValidTrc20Address(addr: string): boolean {
  return /^T[1-9A-HJ-NP-za-km-z]{33}$/.test(addr.trim());
}

function shortenAddress(addr: string, start = 6, end = 4): string {
  if (!addr || addr.length <= start + end + 3) return addr || '';
  return `${addr.slice(0, start)}...${addr.slice(-end)}`;
}

function formatRawAmount(rawAmount: string | number, decimals = 18): string {
  try {
    const rawStr = String(rawAmount || '0').trim();
    if (!rawStr || rawStr === '0') return '0';

    if (rawStr.includes('.')) {
      const num = parseFloat(rawStr);
      return isNaN(num) ? '0' : num.toLocaleString('en-US', { maximumFractionDigits: 6 });
    }

    const dec = Number(decimals) || 18;
    const bigVal = BigInt(rawStr);
    const divisor = BigInt(10 ** dec);
    const integerPart = bigVal / divisor;
    const remainder = bigVal % divisor;

    if (remainder === 0n) {
      return integerPart.toLocaleString('en-US');
    }

    let remainderStr = remainder.toString().padStart(dec, '0');
    remainderStr = remainderStr.replace(/0+$/, '');
    if (remainderStr.length > 6) {
      remainderStr = remainderStr.slice(0, 6);
    }

    return `${integerPart.toLocaleString('en-US')}.${remainderStr}`;
  } catch {
    const dec = Number(decimals) || 18;
    const num = Number(rawAmount) / Math.pow(10, dec);
    return isNaN(num) ? '0' : num.toLocaleString('en-US', { maximumFractionDigits: 6 });
  }
}

function formatRelativeTime(timestampMs: number): string {
  if (!timestampMs || isNaN(timestampMs)) return 'Recently';
  const diffSec = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
  if (diffSec < 45) return 'Just now';
  if (diffSec < 90) return '1 min ago';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mins ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour === 1) return '1 hour ago';
  if (diffHour < 24) return `${diffHour} hours ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return '1 day ago';
  if (diffDay < 30) return `${diffDay} days ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth === 1) return '1 month ago';
  return `${diffMonth} months ago`;
}

function formatExactDate(timestampMs: number): string {
  if (!timestampMs) return '';
  const d = new Date(timestampMs);
  return d.toUTCString().replace('GMT', 'UTC');
}

/**
 * BEP-20 Fetcher
 */
async function fetchBep20Transactions(walletAddress: string): Promise<any[]> {
  const apiKey = process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || '';
  const targetLower = walletAddress.toLowerCase();

  // Try Etherscan V2 API first if API key is provided
  const endpoints: { url: string; headers?: Record<string, string> }[] = [];

  if (apiKey) {
    endpoints.push({
      url: `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&address=${walletAddress}&page=1&offset=15&sort=desc&apikey=${apiKey}`,
    });
    endpoints.push({
      url: `https://api.bscscan.com/api?module=account&action=tokentx&address=${walletAddress}&page=1&offset=15&sort=desc&apikey=${apiKey}`,
    });
  } else {
    // Free endpoints / fallback
    endpoints.push({
      url: `https://api.bscscan.com/api?module=account&action=tokentx&address=${walletAddress}&page=1&offset=15&sort=desc`,
    });
    endpoints.push({
      url: `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&address=${walletAddress}&page=1&offset=15&sort=desc`,
    });
  }

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(ep.url, {
        headers: {
          'User-Agent': 'ChainTrack/1.0',
          'Accept': 'application/json',
          ...(ep.headers || {}),
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!resp.ok) continue;

      const data = await resp.json();

      if (data && data.status === '1' && Array.isArray(data.result)) {
        // Valid BscScan/Etherscan token transfer list
        const rawList = data.result;
        const processed = rawList
          .filter((tx: any) => {
            const from = (tx.from || '').toLowerCase();
            const to = (tx.to || '').toLowerCase();
            return from === targetLower || to === targetLower;
          })
          .slice(0, 3)
          .map((tx: any, index: number) => {
            const timeMs = Number(tx.timeStamp) * 1000;
            const decimals = parseInt(tx.tokenDecimal, 10) || 18;
            const from = tx.from || '';
            const to = tx.to || '';
            const isSender = from.toLowerCase() === targetLower;

            return {
              id: `${tx.hash}-${tx.tokenSymbol || 'BEP20'}-${index}`,
              hash: tx.hash,
              rank: index + 1,
              isLatest: index === 0,
              token: {
                symbol: tx.tokenSymbol || 'UNKNOWN',
                name: tx.tokenName || tx.tokenSymbol || 'BEP-20 Token',
                decimals,
                contractAddress: tx.contractAddress || '',
              },
              rawAmount: tx.value || '0',
              formattedAmount: formatRawAmount(tx.value, decimals),
              direction: isSender ? 'SENT' : 'RECEIVED',
              fromAddress: from,
              toAddress: to,
              timestamp: timeMs,
              formattedDate: formatExactDate(timeMs),
              relativeTime: formatRelativeTime(timeMs),
              blockNumber: parseInt(tx.blockNumber, 10) || undefined,
              explorerUrl: `https://bscscan.com/tx/${tx.hash}`,
              network: 'BEP-20',
            };
          });

        return processed;
      } else if (data && data.status === '0' && data.message === 'No transactions found') {
        return [];
      }
    } catch {
      // Continue to next endpoint if any
    }
  }

  // If external BscScan is blocked or requires key and no key configured,
  // return empty or throw descriptive error
  if (!apiKey) {
    console.warn('[BEP-20] BscScan API query completed without dedicated key. Consider setting BSCSCAN_API_KEY in .env');
  }

  return [];
}

/**
 * TRC-20 Fetcher
 */
async function fetchTrc20Transactions(walletAddress: string): Promise<any[]> {
  const tronGridKey = process.env.TRONGRID_API_KEY || '';
  const targetAddress = walletAddress.trim();
  const targetLower = targetAddress.toLowerCase();

  // Try TronGrid API first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'ChainTrack/1.0',
    };
    if (tronGridKey) {
      headers['TRON-PRO-API-KEY'] = tronGridKey;
    }

    const resp = await fetch(
      `https://api.trongrid.io/v1/accounts/${encodeURIComponent(targetAddress)}/transactions/trc20?limit=10`,
      {
        headers,
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (resp.ok) {
      const json = await resp.json();
      if (json && json.success && Array.isArray(json.data)) {
        const rawList = json.data;
        const validTransfers = rawList
          .filter((tx: any) => {
            const from = (tx.from || '').toLowerCase();
            const to = (tx.to || '').toLowerCase();
            return from === targetLower || to === targetLower;
          })
          .slice(0, 3)
          .map((tx: any, index: number) => {
            const timeMs = Number(tx.block_timestamp) || Date.now();
            const tokenInfo = tx.token_info || {};
            const decimals = parseInt(tokenInfo.decimals, 10) || 6;
            const from = tx.from || '';
            const to = tx.to || '';
            const isSender = from.toLowerCase() === targetLower;
            const val = tx.value || '0';

            return {
              id: `${tx.transaction_id}-${tokenInfo.symbol || 'TRC20'}-${index}`,
              hash: tx.transaction_id,
              rank: index + 1,
              isLatest: index === 0,
              token: {
                symbol: tokenInfo.symbol || 'TRC20',
                name: tokenInfo.name || tokenInfo.symbol || 'TRC-20 Token',
                decimals,
                contractAddress: tokenInfo.address || '',
              },
              rawAmount: val,
              formattedAmount: formatRawAmount(val, decimals),
              direction: isSender ? 'SENT' : 'RECEIVED',
              fromAddress: from,
              toAddress: to,
              timestamp: timeMs,
              formattedDate: formatExactDate(timeMs),
              relativeTime: formatRelativeTime(timeMs),
              explorerUrl: `https://tronscan.org/#/transaction/${tx.transaction_id}`,
              network: 'TRC-20',
            };
          });

        return validTransfers;
      }
    }
  } catch (err) {
    console.error('[TRC-20] TronGrid query failed, attempting TronScan fallback...', err);
  }

  // Fallback to TronScan API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch(
      `https://apilist.tronscanapi.com/api/token_trc20/transfers?limit=10&start=0&sort=-timestamp&count=true&relatedAddress=${encodeURIComponent(
        targetAddress
      )}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ChainTrack/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (resp.ok) {
      const json = await resp.json();
      const rawList = json.token_transfers || [];
      if (Array.isArray(rawList)) {
        const validTransfers = rawList
          .filter((tx: any) => {
            const from = (tx.from_address || '').toLowerCase();
            const to = (tx.to_address || '').toLowerCase();
            return from === targetLower || to === targetLower;
          })
          .slice(0, 3)
          .map((tx: any, index: number) => {
            const timeMs = Number(tx.block_ts) || Date.now();
            const tokenInfo = tx.tokenInfo || {};
            const decimals = parseInt(tokenInfo.tokenDecimal, 10) || 6;
            const from = tx.from_address || '';
            const to = tx.to_address || '';
            const isSender = from.toLowerCase() === targetLower;
            const val = tx.quant || '0';

            return {
              id: `${tx.transaction_id}-${tokenInfo.tokenAbbr || 'TRC20'}-${index}`,
              hash: tx.transaction_id,
              rank: index + 1,
              isLatest: index === 0,
              token: {
                symbol: tokenInfo.tokenAbbr || 'TRC20',
                name: tokenInfo.tokenName || tokenInfo.tokenAbbr || 'TRC-20 Token',
                decimals,
                contractAddress: tx.contract_address || '',
                logoUrl: tokenInfo.tokenLogo || undefined,
              },
              rawAmount: val,
              formattedAmount: formatRawAmount(val, decimals),
              direction: isSender ? 'SENT' : 'RECEIVED',
              fromAddress: from,
              toAddress: to,
              timestamp: timeMs,
              formattedDate: formatExactDate(timeMs),
              relativeTime: formatRelativeTime(timeMs),
              explorerUrl: `https://tronscan.org/#/transaction/${tx.transaction_id}`,
              network: 'TRC-20',
            };
          });

        return validTransfers;
      }
    }
  } catch (err) {
    console.error('[TRC-20] TronScan query fallback failed:', err);
  }

  return [];
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    networks: {
      'BEP-20': {
        name: 'BNB Smart Chain',
        hasBscKey: Boolean(process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY),
        status: 'operational',
      },
      'TRC-20': {
        name: 'TRON',
        hasTronKey: Boolean(process.env.TRONGRID_API_KEY),
        status: 'operational',
      },
    },
  });
});

/**
 * Main transactions query endpoint
 */
app.get('/api/transactions', async (req: Request, res: Response) => {
  try {
    const address = String(req.query.address || '').trim();
    const network = String(req.query.network || 'BEP-20').trim().toUpperCase() as 'BEP-20' | 'TRC-20';

    if (!address) {
      res.status(400).json({
        success: false,
        error: 'Wallet address is required',
        message: 'Please provide a wallet address to check transactions.',
      });
      return;
    }

    if (network !== 'BEP-20' && network !== 'TRC-20') {
      res.status(400).json({
        success: false,
        error: 'Invalid network',
        message: 'Network must be either BEP-20 or TRC-20.',
      });
      return;
    }

    // Validate address format according to network
    if (network === 'BEP-20' && !isValidBep20Address(address)) {
      res.status(400).json({
        success: false,
        error: 'Invalid BEP-20 address',
        message: 'Please enter a valid BEP-20 wallet address.',
      });
      return;
    }

    if (network === 'TRC-20' && !isValidTrc20Address(address)) {
      res.status(400).json({
        success: false,
        error: 'Invalid TRC-20 address',
        message: 'Please enter a valid TRC-20 wallet address.',
      });
      return;
    }

    // Cache check
    const cacheKey = `${network}:${address.toLowerCase()}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.json({
        ...cachedData,
        cached: true,
      });
      return;
    }

    let transactions: any[] = [];
    if (network === 'BEP-20') {
      transactions = await fetchBep20Transactions(address);
    } else {
      transactions = await fetchTrc20Transactions(address);
    }

    const payload = {
      success: true,
      network,
      walletAddress: address,
      shortAddress: shortenAddress(address),
      totalFound: transactions.length,
      transactions,
      timestamp: Date.now(),
    };

    // Cache successful responses for 20 seconds
    setCache(cacheKey, payload, 20);

    res.json(payload);
  } catch (error: any) {
    console.error('API Error in /api/transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Query failed',
      message: 'Unable to fetch transactions right now. Please try again.',
    });
  }
});

/**
 * Start Server & mount Vite
 */
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ChainTrack] Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
