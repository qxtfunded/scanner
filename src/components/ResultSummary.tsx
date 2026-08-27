import React from 'react';
import { Layers, Wallet, CheckCircle2 } from 'lucide-react';
import { BlockchainNetwork } from '../types';
import { shortenAddress } from '../utils/formatters';

interface ResultSummaryProps {
  network: BlockchainNetwork;
  walletAddress: string;
  totalFound: number;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  network,
  walletAddress,
  totalFound,
}) => {
  const isBsc = network === 'BEP-20';

  return (
    <div
      id="result-summary-bar"
      className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs sm:text-sm font-medium text-zinc-300 backdrop-blur-md shadow-sm mb-4"
    >
      <div className="flex items-center gap-2">
        <span
          className={`font-bold px-2 py-0.5 rounded text-xs ${
            isBsc
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {network}
        </span>
        <span className="text-zinc-600">|</span>
        <span className="font-mono text-zinc-300 flex items-center gap-1">
          <Wallet className="w-3.5 h-3.5 text-zinc-500" />
          {shortenAddress(walletAddress, 6, 4)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs sm:text-sm">
        <CheckCircle2 className="w-4 h-4" />
        <span>
          {totalFound} {totalFound === 1 ? 'transaction' : 'transactions'} found
        </span>
      </div>
    </div>
  );
};
