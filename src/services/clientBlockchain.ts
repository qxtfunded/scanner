/**
 * WARNING: Third-party API keys configured client-side for static Vercel deployment as requested by user.
 */

import { BlockchainNetwork, TokenTransaction, TransactionQueryResponse } from '../types';
import { formatTokenAmount, formatRelativeTime, formatExactDateTime, shortenAddress } from '../utils/formatters';

// Read Vite client-side environment variables
const CLIENT_BSCSCAN_API_KEY =
  (import.meta.env.VITE_BSCSCAN_API_KEY as string | undefined) ||
  (import.meta.env.VITE_ETHERSCAN_API_KEY as string | undefined) ||
  '';

const CLIENT_TRONGRID_API_KEY =
  (import.meta.env.VITE_TRONGRID_API_KEY as string | undefined) || '';

/**
 * Fetch latest BEP-20 token transfers directly in browser
 */
export async function fetchBep20TransactionsClient(walletAddress: string): Promise<TokenTransaction[]> {
  const apiKey = CLIENT_BSCSCAN_API_KEY.trim();
  const targetLower = walletAddress.trim().toLowerCase();

  const endpoints: { url: string; headers?: Record<string, string> }[] = [];

  if (apiKey) {
    endpoints.push({
      url: `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&address=${walletAddress}&page=1&offset=15&sort=desc&apikey=${apiKey}`,
    });
    endpoints.push({
      url: `https://api.bscscan.com/api?module=account&action=tokentx&address=${walletAddress}&page=1&offset=15&sort=desc&apikey=${apiKey}`,
    });
  } else {
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
          'Accept': 'application/json',
          ...(ep.headers || {}),
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!resp.ok) continue;

      const data = await resp.json();

      if (data && data.status === '1' && Array.isArray(data.result)) {
        const rawList = data.result;
        const processed: TokenTransaction[] = rawList
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
              formattedAmount: formatTokenAmount(tx.value, decimals),
              direction: isSender ? 'SENT' : 'RECEIVED',
              fromAddress: from,
              toAddress: to,
              timestamp: timeMs,
              formattedDate: formatExactDateTime(timeMs),
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
      // Continue to fallback endpoint
    }
  }

  return [];
}

/**
 * Fetch latest TRC-20 token transfers directly in browser
 */
export async function fetchTrc20TransactionsClient(walletAddress: string): Promise<TokenTransaction[]> {
  const tronGridKey = CLIENT_TRONGRID_API_KEY.trim();
  const targetAddress = walletAddress.trim();
  const targetLower = targetAddress.toLowerCase();

  // Try TronGrid API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
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
        const validTransfers: TokenTransaction[] = rawList
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
              formattedAmount: formatTokenAmount(val, decimals),
              direction: isSender ? 'SENT' : 'RECEIVED',
              fromAddress: from,
              toAddress: to,
              timestamp: timeMs,
              formattedDate: formatExactDateTime(timeMs),
              relativeTime: formatRelativeTime(timeMs),
              explorerUrl: `https://tronscan.org/#/transaction/${tx.transaction_id}`,
              network: 'TRC-20',
            };
          });

        return validTransfers;
      }
    }
  } catch (err) {
    console.warn('[TRC-20 Client] TronGrid direct query error, falling back to TronScan:', err);
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
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (resp.ok) {
      const json = await resp.json();
      const rawList = json.token_transfers || [];
      if (Array.isArray(rawList)) {
        const validTransfers: TokenTransaction[] = rawList
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
              formattedAmount: formatTokenAmount(val, decimals),
              direction: isSender ? 'SENT' : 'RECEIVED',
              fromAddress: from,
              toAddress: to,
              timestamp: timeMs,
              formattedDate: formatExactDateTime(timeMs),
              relativeTime: formatRelativeTime(timeMs),
              explorerUrl: `https://tronscan.org/#/transaction/${tx.transaction_id}`,
              network: 'TRC-20',
            };
          });

        return validTransfers;
      }
    }
  } catch (err) {
    console.error('[TRC-20 Client] TronScan direct fallback error:', err);
  }

  return [];
}

/**
 * Execute client-side token transfer lookup directly
 */
export async function executeClientSearch(
  address: string,
  network: BlockchainNetwork
): Promise<TransactionQueryResponse> {
  const trimmed = address.trim();
  let transactions: TokenTransaction[] = [];

  if (network === 'BEP-20') {
    transactions = await fetchBep20TransactionsClient(trimmed);
  } else {
    transactions = await fetchTrc20TransactionsClient(trimmed);
  }

  return {
    success: true,
    network,
    walletAddress: trimmed,
    shortAddress: shortenAddress(trimmed),
    totalFound: transactions.length,
    transactions,
    timestamp: Date.now(),
  };
}
