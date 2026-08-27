/**
 * WARNING: Third-party API keys configured client-side for static Vercel deployment as requested by user.
 */

import { BlockchainNetwork, TokenTransaction, TransactionQueryResponse } from '../types';
import { formatTokenAmount, formatRelativeTime, formatExactDateTime, shortenAddress } from '../utils/formatters';
import { getUserCustomKeys } from '../components/ApiKeyModal';

/**
 * Get active BSC API Key from localStorage or Vite env
 */
function getActiveBscKey(): string {
  const custom = getUserCustomKeys();
  if (custom.bscScanKey && custom.bscScanKey.trim().length > 0) {
    return custom.bscScanKey.trim();
  }
  return (
    (import.meta.env.VITE_BSCSCAN_API_KEY as string | undefined) ||
    (import.meta.env.VITE_ETHERSCAN_API_KEY as string | undefined) ||
    ''
  ).trim();
}

/**
 * Get active Tron API Key from localStorage or Vite env
 */
function getActiveTronKey(): string {
  const custom = getUserCustomKeys();
  if (custom.tronGridKey && custom.tronGridKey.trim().length > 0) {
    return custom.tronGridKey.trim();
  }
  return (import.meta.env.VITE_TRONGRID_API_KEY as string | undefined || '').trim();
}

/**
 * Fetch latest BEP-20 token transfers & native BNB transactions directly in browser
 */
export async function fetchBep20TransactionsClient(walletAddress: string): Promise<TokenTransaction[]> {
  const apiKey = getActiveBscKey();
  const targetAddress = walletAddress.trim();
  const targetLower = targetAddress.toLowerCase();

  const allTxs: TokenTransaction[] = [];
  let apiKeyRequiredError: string | null = null;

  // 1. Fetch BEP-20 Token Transfers
  try {
    const tokenUrl = apiKey
      ? `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&address=${encodeURIComponent(targetAddress)}&page=1&offset=15&sort=desc&apikey=${apiKey}`
      : `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&address=${encodeURIComponent(targetAddress)}&page=1&offset=15&sort=desc`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch(tokenUrl, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.status === '1' && Array.isArray(data.result)) {
        for (const tx of data.result) {
          const from = (tx.from || '').toLowerCase();
          const to = (tx.to || '').toLowerCase();
          if (from === targetLower || to === targetLower) {
            const timeMs = Number(tx.timeStamp) * 1000;
            const decimals = parseInt(tx.tokenDecimal, 10) || 18;
            const isSender = from === targetLower;

            allTxs.push({
              id: `${tx.hash}-${tx.tokenSymbol || 'BEP20'}-${allTxs.length}`,
              hash: tx.hash,
              rank: 1, // Will be re-ranked after merge
              isLatest: false,
              token: {
                symbol: tx.tokenSymbol || 'UNKNOWN',
                name: tx.tokenName || tx.tokenSymbol || 'BEP-20 Token',
                decimals,
                contractAddress: tx.contractAddress || '',
              },
              rawAmount: tx.value || '0',
              formattedAmount: formatTokenAmount(tx.value, decimals),
              direction: isSender ? 'SENT' : 'RECEIVED',
              fromAddress: tx.from || '',
              toAddress: tx.to || '',
              timestamp: timeMs,
              formattedDate: formatExactDateTime(timeMs),
              relativeTime: formatRelativeTime(timeMs),
              blockNumber: parseInt(tx.blockNumber, 10) || undefined,
              explorerUrl: `https://bscscan.com/tx/${tx.hash}`,
              network: 'BEP-20',
            });
          }
        }
      } else if (data && data.status === '0' && typeof data.result === 'string') {
        if (data.result.includes('Free API access is not supported') || data.result.includes('api plan') || data.result.includes('Invalid API Key') || data.result.includes('deprecated')) {
          apiKeyRequiredError = data.result;
        }
      }
    }
  } catch (err) {
    console.warn('[BEP-20 Client] Token transfer query error:', err);
  }

  // 2. Also fetch Native BNB Transactions (if any native transfers were made)
  if (apiKey) {
    try {
      const nativeUrl = `https://api.etherscan.io/v2/api?chainid=56&module=account&action=txlist&address=${encodeURIComponent(targetAddress)}&page=1&offset=15&sort=desc&apikey=${apiKey}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(nativeUrl, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.status === '1' && Array.isArray(data.result)) {
          for (const tx of data.result) {
            const from = (tx.from || '').toLowerCase();
            const to = (tx.to || '').toLowerCase();
            if ((from === targetLower || to === targetLower) && tx.value && tx.value !== '0') {
              const timeMs = Number(tx.timeStamp) * 1000;
              const isSender = from === targetLower;

              allTxs.push({
                id: `${tx.hash}-BNB-${allTxs.length}`,
                hash: tx.hash,
                rank: 1,
                isLatest: false,
                token: {
                  symbol: 'BNB',
                  name: 'BNB (Native Coin)',
                  decimals: 18,
                  contractAddress: '',
                },
                rawAmount: tx.value || '0',
                formattedAmount: formatTokenAmount(tx.value, 18),
                direction: isSender ? 'SENT' : 'RECEIVED',
                fromAddress: tx.from || '',
                toAddress: tx.to || '',
                timestamp: timeMs,
                formattedDate: formatExactDateTime(timeMs),
                relativeTime: formatRelativeTime(timeMs),
                blockNumber: parseInt(tx.blockNumber, 10) || undefined,
                explorerUrl: `https://bscscan.com/tx/${tx.hash}`,
                network: 'BEP-20',
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('[BEP-20 Client] Native BNB query error:', err);
    }
  }

  // If no transactions found and an explicit API key error was returned by BscScan
  if (allTxs.length === 0 && apiKeyRequiredError) {
    throw new Error(
      'BscScan requires a free API key to query BSC transactions. Please click the ⚙️ Settings icon in the top header and add your free BscScan API Key.'
    );
  }

  // Sort chronologically descending and take top 3
  const sorted = allTxs
    .sort((a, b) => b.timestamp - a.timestamp)
    // Remove duplicate transaction hashes
    .filter((tx, idx, arr) => arr.findIndex((t) => t.hash === tx.hash) === idx)
    .slice(0, 3)
    .map((tx, idx) => ({
      ...tx,
      rank: idx + 1,
      isLatest: idx === 0,
    }));

  return sorted;
}

/**
 * Fetch latest TRC-20 token transfers & TRX native transfers directly in browser
 */
export async function fetchTrc20TransactionsClient(walletAddress: string): Promise<TokenTransaction[]> {
  const tronGridKey = getActiveTronKey();
  const targetAddress = walletAddress.trim();
  const targetLower = targetAddress.toLowerCase();

  const allTxs: TokenTransaction[] = [];

  // 1. Try TronScan TRC-20 transfers endpoint (Direct public API, high reliability)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch(
      `https://apilist.tronscanapi.com/api/token_trc20/transfers?limit=15&start=0&sort=-timestamp&count=true&relatedAddress=${encodeURIComponent(
        targetAddress
      )}`,
      {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (resp.ok) {
      const json = await resp.json();
      const rawList = json.token_transfers || [];
      if (Array.isArray(rawList)) {
        for (const tx of rawList) {
          const from = (tx.from_address || '').toLowerCase();
          const to = (tx.to_address || '').toLowerCase();
          if (from === targetLower || to === targetLower) {
            const timeMs = Number(tx.block_ts) || Date.now();
            const tokenInfo = tx.tokenInfo || {};
            const decimals = parseInt(tokenInfo.tokenDecimal, 10) || 6;
            const isSender = from === targetLower;
            const val = tx.quant || '0';

            allTxs.push({
              id: `${tx.transaction_id}-${tokenInfo.tokenAbbr || 'TRC20'}-${allTxs.length}`,
              hash: tx.transaction_id,
              rank: 1,
              isLatest: false,
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
              fromAddress: tx.from_address || '',
              toAddress: tx.to_address || '',
              timestamp: timeMs,
              formattedDate: formatExactDateTime(timeMs),
              relativeTime: formatRelativeTime(timeMs),
              explorerUrl: `https://tronscan.org/#/transaction/${tx.transaction_id}`,
              network: 'TRC-20',
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[TRC-20 Client] TronScan TRC-20 query failed:', err);
  }

  // 2. Also try TronGrid endpoint
  if (allTxs.length === 0) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (tronGridKey) {
        headers['TRON-PRO-API-KEY'] = tronGridKey;
      }

      const resp = await fetch(
        `https://api.trongrid.io/v1/accounts/${encodeURIComponent(targetAddress)}/transactions/trc20?limit=15`,
        { headers, signal: controller.signal }
      );
      clearTimeout(timeout);

      if (resp.ok) {
        const json = await resp.json();
        if (json && json.success && Array.isArray(json.data)) {
          for (const tx of json.data) {
            const from = (tx.from || '').toLowerCase();
            const to = (tx.to || '').toLowerCase();
            if (from === targetLower || to === targetLower) {
              const timeMs = Number(tx.block_timestamp) || Date.now();
              const tokenInfo = tx.token_info || {};
              const decimals = parseInt(tokenInfo.decimals, 10) || 6;
              const isSender = from === targetLower;
              const val = tx.value || '0';

              allTxs.push({
                id: `${tx.transaction_id}-${tokenInfo.symbol || 'TRC20'}-${allTxs.length}`,
                hash: tx.transaction_id,
                rank: 1,
                isLatest: false,
                token: {
                  symbol: tokenInfo.symbol || 'TRC20',
                  name: tokenInfo.name || tokenInfo.symbol || 'TRC-20 Token',
                  decimals,
                  contractAddress: tokenInfo.address || '',
                },
                rawAmount: val,
                formattedAmount: formatTokenAmount(val, decimals),
                direction: isSender ? 'SENT' : 'RECEIVED',
                fromAddress: tx.from || '',
                toAddress: tx.to || '',
                timestamp: timeMs,
                formattedDate: formatExactDateTime(timeMs),
                relativeTime: formatRelativeTime(timeMs),
                explorerUrl: `https://tronscan.org/#/transaction/${tx.transaction_id}`,
                network: 'TRC-20',
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('[TRC-20 Client] TronGrid query failed:', err);
    }
  }

  // 3. Also fetch native TRX transactions (if any native transfers were sent)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const resp = await fetch(
      `https://apilist.tronscanapi.com/api/transaction?sort=-timestamp&count=true&limit=15&start=0&address=${encodeURIComponent(
        targetAddress
      )}`,
      { headers: { 'Accept': 'application/json' }, signal: controller.signal }
    );
    clearTimeout(timeout);

    if (resp.ok) {
      const json = await resp.json();
      const rawList = json.data || [];
      if (Array.isArray(rawList)) {
        for (const tx of rawList) {
          const owner = (tx.ownerAddress || '').toLowerCase();
          const to = (tx.toAddress || '').toLowerCase();
          const isOwner = owner === targetLower;
          const isReceiver = to === targetLower;

          if ((isOwner || isReceiver) && tx.amount && tx.amount !== '0' && tx.amount !== 0) {
            const timeMs = Number(tx.timestamp) || Date.now();
            const val = String(tx.amount || '0');

            allTxs.push({
              id: `${tx.hash}-TRX-${allTxs.length}`,
              hash: tx.hash,
              rank: 1,
              isLatest: false,
              token: {
                symbol: 'TRX',
                name: 'TRON (Native Coin)',
                decimals: 6,
                contractAddress: '',
                logoUrl: 'https://static.tronscan.org/production/logo/trx.png',
              },
              rawAmount: val,
              formattedAmount: formatTokenAmount(val, 6),
              direction: isOwner ? 'SENT' : 'RECEIVED',
              fromAddress: tx.ownerAddress || '',
              toAddress: tx.toAddress || '',
              timestamp: timeMs,
              formattedDate: formatExactDateTime(timeMs),
              relativeTime: formatRelativeTime(timeMs),
              explorerUrl: `https://tronscan.org/#/transaction/${tx.hash}`,
              network: 'TRC-20',
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[TRC-20 Client] Native TRX query failed:', err);
  }

  // Sort chronologically descending and take top 3
  const sorted = allTxs
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((tx, idx, arr) => arr.findIndex((t) => t.hash === tx.hash) === idx)
    .slice(0, 3)
    .map((tx, idx) => ({
      ...tx,
      rank: idx + 1,
      isLatest: idx === 0,
    }));

  return sorted;
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
