import React from 'react';
import { Inbox, ExternalLink, HelpCircle, ArrowRightLeft, Clock } from 'lucide-react';
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
      className="w-full max-w-2xl mx-auto mt-8 sm:mt-10 p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center backdrop-blur-md animate-fadeIn"
    >
      <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 mx-auto flex items-center justify-center text-zinc-400 mb-4 shadow-inner">
        <Inbox className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">No Transactions Found</h3>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
        No recent {network} transfers were returned for wallet address{' '}
        <span className="font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">{shortenAddress(walletAddress, 6, 4)}</span>.
      </p>

      {/* Troubleshooting tips */}
      <div className="text-left bg-zinc-950/60 rounded-2xl p-4 border border-zinc-800/80 mb-6 space-y-3">
        <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>If you just performed a transaction:</span>
        </div>
        <ul className="text-[11px] sm:text-xs text-zinc-400 space-y-2 pl-5 list-disc">
          <li>
            <strong className="text-zinc-200">Pending Block Indexing:</strong> Newly mined transactions take 15–30 seconds to be indexed by public blockchain explorers.
          </li>
          <li>
            <strong className="text-zinc-200">Network Match:</strong> Confirm whether the transfer was made on <span className="text-amber-300">BNB Smart Chain (BEP-20)</span> or <span className="text-red-300">TRON (TRC-20)</span>.
          </li>
          <li>
            <strong className="text-zinc-200">Direct Explorer Verification:</strong> You can verify the raw live ledger directly on the official blockchain explorer below.
          </li>
        </ul>
      </div>

      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs sm:text-sm font-semibold text-zinc-100 hover:text-white border border-zinc-700/80 transition-all cursor-pointer select-none active:scale-95 shadow-md"
      >
        <span>Open in {isBsc ? 'BscScan Explorer' : 'TronScan Explorer'}</span>
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
};
