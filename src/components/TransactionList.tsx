import React, { useState } from 'react';
import { Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';
import { TokenTransaction, BlockchainNetwork } from '../types';
import { shortenAddress, getExplorerAddressUrl } from '../utils/formatters';
import { ResultSummary } from './ResultSummary';
import { TransactionCard } from './TransactionCard';

interface TransactionListProps {
  network: BlockchainNetwork;
  walletAddress: string;
  transactions: TokenTransaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({
  network,
  walletAddress,
  transactions,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const isBsc = network === 'BEP-20';

  const handleCopySearchedAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 1800);
  };

  const explorerAddressUrl = getExplorerAddressUrl(walletAddress, network);

  return (
    <section id="results-area" className="w-full max-w-4xl mx-auto mt-8 sm:mt-10 animate-fadeIn">
      {/* Result Summary Bar */}
      <ResultSummary
        network={network}
        walletAddress={walletAddress}
        totalFound={transactions.length}
      />

      {/* Network Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {network} Transactions
            </h2>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isBsc
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'bg-red-400/20 text-red-300 border border-red-400/30'
              }`}
            >
              Latest {transactions.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Latest 3 token transactions recorded for this wallet.
          </p>
        </div>

        {/* Searched Wallet Card with Copy & External Link */}
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Wallet Address</span>
            <span className="font-mono text-xs sm:text-sm text-zinc-200 font-medium">
              {shortenAddress(walletAddress, 8, 6)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopySearchedAddress}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Copy wallet address"
          >
            {copiedAddress ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-1">
                <Check className="w-3.5 h-3.5" /> Copied ✓
              </span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          <a
            href={explorerAddressUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="View wallet in blockchain explorer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Transaction Cards List */}
      <div className="space-y-4">
        {transactions.map((tx) => (
          <TransactionCard
            key={tx.id}
            tx={tx}
            queriedAddress={walletAddress}
          />
        ))}
      </div>
    </section>
  );
};
