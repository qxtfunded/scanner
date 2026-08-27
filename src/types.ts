export type BlockchainNetwork = 'BEP-20' | 'TRC-20';

export interface TokenInfo {
  symbol: string;
  name?: string;
  decimals: number;
  contractAddress?: string;
  logoUrl?: string;
}

export type TransactionDirection = 'SENT' | 'RECEIVED';

export interface TokenTransaction {
  id: string;
  hash: string;
  rank: number; // 1, 2, 3
  isLatest: boolean;
  token: TokenInfo;
  rawAmount: string;
  formattedAmount: string;
  direction: TransactionDirection;
  fromAddress: string;
  toAddress: string;
  timestamp: number; // Unix timestamp in milliseconds
  formattedDate: string;
  relativeTime: string;
  blockNumber?: number;
  explorerUrl: string;
  network: BlockchainNetwork;
}

export interface TransactionQueryResponse {
  success: boolean;
  network: BlockchainNetwork;
  walletAddress: string;
  shortAddress: string;
  totalFound: number;
  transactions: TokenTransaction[];
  cached?: boolean;
  timestamp: number;
  message?: string;
  warning?: string;
}

export interface SearchHistoryItem {
  address: string;
  network: BlockchainNetwork;
  timestamp: number;
}

export interface NetworkConfig {
  id: BlockchainNetwork;
  name: string;
  chainName: string;
  nativeCurrency: string;
  standard: string;
  addressPrefix: string;
  placeholder: string;
  explorerName: string;
  explorerTxBaseUrl: string;
  explorerAddressBaseUrl: string;
  accentColor: string; // Tailwind hex / class
  badgeColor: string;
  glowColor: string;
}
