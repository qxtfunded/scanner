import { BlockchainNetwork, NetworkConfig } from '../types';

export const NETWORKS: Record<BlockchainNetwork, NetworkConfig> = {
  'BEP-20': {
    id: 'BEP-20',
    name: 'BEP-20',
    chainName: 'BNB Smart Chain',
    nativeCurrency: 'BNB',
    standard: 'BEP-20 Token',
    addressPrefix: '0x',
    placeholder: '0x...',
    explorerName: 'BscScan',
    explorerTxBaseUrl: 'https://bscscan.com/tx/',
    explorerAddressBaseUrl: 'https://bscscan.com/address/',
    accentColor: '#F0B90B',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    glowColor: 'rgba(240, 185, 11, 0.25)',
  },
  'TRC-20': {
    id: 'TRC-20',
    name: 'TRC-20',
    chainName: 'TRON Network',
    nativeCurrency: 'TRX',
    standard: 'TRC-20 Token',
    addressPrefix: 'T',
    placeholder: 'T...',
    explorerName: 'TronScan',
    explorerTxBaseUrl: 'https://tronscan.org/#/transaction/',
    explorerAddressBaseUrl: 'https://tronscan.org/#/address/',
    accentColor: '#EF4444',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    glowColor: 'rgba(239, 68, 68, 0.25)',
  },
};

/**
 * Shortens an address or hash to start...end format.
 * E.g., 0x1234567890abcdef1234567890abcdef12345678 -> 0x1234...5678
 */
export function shortenAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  const trimmed = address.trim();
  if (trimmed.length <= startChars + endChars + 3) return trimmed;
  return `${trimmed.substring(0, startChars)}...${trimmed.substring(trimmed.length - endChars)}`;
}

/**
 * Shortens a transaction hash.
 * E.g., 0x82af56...91cd
 */
export function shortenHash(hash: string, startChars: number = 6, endChars: number = 4): string {
  if (!hash) return '';
  const trimmed = hash.trim();
  if (trimmed.length <= startChars + endChars + 3) return trimmed;
  return `${trimmed.substring(0, startChars)}...${trimmed.substring(trimmed.length - endChars)}`;
}

/**
 * Converts raw token balance string to human-readable number with correct decimals.
 */
export function formatTokenAmount(rawAmount: string | number, decimals: number = 18): string {
  try {
    const rawStr = String(rawAmount || '0').trim();
    if (!rawStr || rawStr === '0') return '0';

    // If already contains a decimal point
    if (rawStr.includes('.')) {
      const num = parseFloat(rawStr);
      return isNaN(num) ? '0' : num.toLocaleString('en-US', { maximumFractionDigits: 6 });
    }

    // Handle BigInt / large numbers
    const bigVal = BigInt(rawStr);
    const divisor = BigInt(10 ** decimals);
    const integerPart = bigVal / divisor;
    const remainder = bigVal % divisor;

    if (remainder === 0n) {
      return integerPart.toLocaleString('en-US');
    }

    let remainderStr = remainder.toString().padStart(decimals, '0');
    // Trim trailing zeros
    remainderStr = remainderStr.replace(/0+$/, '');
    // Take at most 6 decimal digits for clean readability
    if (remainderStr.length > 6) {
      remainderStr = remainderStr.substring(0, 6);
    }

    const formattedInt = integerPart.toLocaleString('en-US');
    return `${formattedInt}.${remainderStr}`;
  } catch {
    const num = Number(rawAmount) / Math.pow(10, decimals);
    return isNaN(num) ? '0' : num.toLocaleString('en-US', { maximumFractionDigits: 6 });
  }
}

/**
 * Formats a Unix timestamp in milliseconds into human-readable relative time (e.g. "2 minutes ago").
 */
export function formatRelativeTime(timestampMs: number): string {
  if (!timestampMs || isNaN(timestampMs)) return 'Recently';

  const now = Date.now();
  const diffMs = now - timestampMs;

  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 90) return '1 minute ago';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minutes ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour === 1) return '1 hour ago';
  if (diffHour < 24) return `${diffHour} hours ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return '1 day ago';
  if (diffDay < 30) return `${diffDay} days ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth === 1) return '1 month ago';
  if (diffMonth < 12) return `${diffMonth} months ago`;

  const diffYear = Math.floor(diffDay / 365);
  if (diffYear === 1) return '1 year ago';
  return `${diffYear} years ago`;
}

/**
 * Formats exact date and time in UTC (e.g., "Aug 27, 2026, 22:12:00 UTC").
 */
export function formatExactDateTime(timestampMs: number): string {
  if (!timestampMs || isNaN(timestampMs)) return '';
  const date = new Date(timestampMs);
  return date.toUTCString().replace('GMT', 'UTC');
}

/**
 * Returns explorer transaction link.
 */
export function getExplorerTxUrl(hash: string, network: BlockchainNetwork): string {
  const config = NETWORKS[network];
  return `${config.explorerTxBaseUrl}${hash}`;
}

/**
 * Returns explorer address link.
 */
export function getExplorerAddressUrl(address: string, network: BlockchainNetwork): string {
  const config = NETWORKS[network];
  return `${config.explorerAddressBaseUrl}${address}`;
}
