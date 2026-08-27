import React from 'react';
import { Inbox, ExternalLink } from 'lucide-react';
import { BlockchainNetwork } from '../types';
import { shortenAddress, getExplorerAddressUrl } from '../utils/formatters';

interface NoTransactionsStateProps {
  network: BlockchainNetwork;
  walletAddress: string;
}

export const NoTransactionsState: React.FC<NoTransactionsStateProps> = ({
  network,
  walletAddress,
}) => {
  const isBsc = network === 'BEP-20';
  const explorerUrl = getExplorerAddressUrl(walletAddress, network);

  return (
    <div
      id="no-transactions-state"
      className="w-full max-w-2xl mx-auto mt-8 sm:mt-10 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center backdrop-blur-md animate-fadeIn"
    >
      <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 mx-auto flex items-center justify-center text-zinc-400 mb-4 shadow-inner">
        <Inbox className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">No token transactions found</h3>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
        We couldn't find any recent {network} token transfers for this address (
        <span className="font-mono text-zinc-300">{shortenAddress(walletAddress, 6, 4)}</span>).
      </p>

      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white border border-zinc-700/60 transition-all cursor-pointer select-none"
      >
        <span>View on {isBsc ? 'BscScan' : 'TronScan'}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
