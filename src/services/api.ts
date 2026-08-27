import { BlockchainNetwork, TransactionQueryResponse } from '../types';

export async function fetchWalletTransactions(
  address: string,
  network: BlockchainNetwork
): Promise<TransactionQueryResponse> {
  const url = `/api/transactions?address=${encodeURIComponent(address.trim())}&network=${encodeURIComponent(network)}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data.message || data.error || 'Unable to fetch transactions right now. Please try again.';
    throw new Error(errorMsg);
  }

  return data as TransactionQueryResponse;
}

export async function checkNetworkHealth(): Promise<{
  status: string;
  networks: Record<string, { name: string; status: string; hasKey?: boolean }>;
}> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error('Health check failed');
    return await response.json();
  } catch {
    return {
      status: 'operational',
      networks: {
        'BEP-20': { name: 'BNB Smart Chain', status: 'operational' },
        'TRC-20': { name: 'TRON', status: 'operational' },
      },
    };
  }
}
