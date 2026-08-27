import { BlockchainNetwork } from '../types';

/**
 * Validates a BNB Smart Chain (BEP-20 / EVM) wallet address.
 * Format: 0x followed by 40 hexadecimal characters (case-insensitive).
 */
export function isValidBep20Address(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return /^0x[0-9a-fA-F]{40}$/.test(trimmed);
}

/**
 * Validates a TRON (TRC-20) wallet address.
 * Format: Starts with 'T', 34 characters long, base58 characters.
 */
export function isValidTrc20Address(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return /^T[1-9A-HJ-NP-za-km-z]{33}$/.test(trimmed);
}

/**
 * Validates wallet address based on selected network.
 */
export function validateWalletAddress(address: string, network: BlockchainNetwork): {
  isValid: boolean;
  errorMessage?: string;
} {
  const trimmed = (address || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: `Please enter a ${network} wallet address.`,
    };
  }

  if (network === 'BEP-20') {
    if (!isValidBep20Address(trimmed)) {
      return {
        isValid: false,
        errorMessage: 'Please enter a valid BEP-20 wallet address.',
      };
    }
  } else if (network === 'TRC-20') {
    if (!isValidTrc20Address(trimmed)) {
      return {
        isValid: false,
        errorMessage: 'Please enter a valid TRC-20 wallet address.',
      };
    }
  }

  return { isValid: true };
}
