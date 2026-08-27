/**
 * WARNING: Third-party API keys configured client-side for static Vercel deployment as requested by user.
 */

import { BlockchainNetwork, TransactionQueryResponse } from '../types';
import { executeClientSearch } from './clientBlockchain';

export async function fetchWalletTransactions(
  address: string,
  network: BlockchainNetwork
): Promise<TransactionQueryResponse> {
  const trimmed = address.trim();

  // Try backend proxy if available, with graceful automatic fallback to direct browser client
  try {
    const url = `/api/transactions?address=${encodeURIComponent(trimmed)}&network=${encodeURIComponent(network)}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    // If server responded with JSON payload
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (response.ok && data.success) {
        return data as TransactionQueryResponse;
      }
      if (data.error && data.message && (response.status === 400)) {
        // Bad request format error from validator
        throw new Error(data.message);
      }
    }
  } catch (backendError: any) {
    // If it's an explicit validation error, re-throw
    if (backendError.message && backendError.message.includes('valid')) {
      throw backendError;
    }
    // Otherwise fallback to direct client-side execution
  }

  // Fallback / Direct Vercel frontend execution
  try {
    return await executeClientSearch(trimmed, network);
  } catch (clientError: any) {
    throw new Error(clientError.message || 'Unable to fetch transactions right now. Please try again.');
  }
}

export async function checkNetworkHealth(): Promise<{
  status: string;
  networks: Record<string, { name: string; status: string; hasKey?: boolean }>;
}> {
  const hasBscKey = Boolean(
    import.meta.env.VITE_BSCSCAN_API_KEY ||
    import.meta.env.VITE_ETHERSCAN_API_KEY
  );
  const hasTronKey = Boolean(import.meta.env.VITE_TRONGRID_API_KEY);

  return {
    status: 'operational',
    networks: {
      'BEP-20': {
        name: 'BNB Smart Chain',
        status: 'operational',
        hasKey: hasBscKey,
      },
      'TRC-20': {
        name: 'TRON',
        status: 'operational',
        hasKey: hasTronKey,
      },
    },
  };
}
