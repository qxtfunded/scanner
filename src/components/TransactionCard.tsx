import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Hash,
  Coins,
} from 'lucide-react';
import { TokenTransaction } from '../types';
import { shortenAddress, shortenHash } from '../utils/formatters';

interface TransactionCardProps {
  tx: TokenTransaction;
  queriedAddress: string;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ tx, queriedAddress }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 1800);
  };

  const isSent = tx.direction === 'SENT';
  const isLatest = tx.rank === 1;

  return (
    <div
      id={`transaction-card-${tx.rank}`}
      className={`relative w-full rounded-2xl bg-zinc-900/70 border backdrop-blur-xl p-5 sm:p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:translate-y-[-2px] ${
        isLatest
          ? 'border-zinc-700/80 shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
          : 'border-zinc-800/80 shadow-md'
      }`}
    >
      {/* Top Bar: Rank badge + Direction badge + Time */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-zinc-800/70">
        <div className="flex items-center gap-2">
          {/* Rank Badge */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
              isLatest
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700/50'
            }`}
          >
            {isLatest ? '#1 Latest' : `#${tx.rank}`}
          </span>

          {/* Direction Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase ${
              isSent
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isSent ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>SENT</span>
              </>
            ) : (
              <>
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>RECEIVED</span>
              </>
            )}
          </span>
        </div>

        {/* Relative & Exact Timestamp */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-medium text-zinc-300">{tx.relativeTime}</span>
        </div>
      </div>

      {/* Main Content: Token Amount & Token Info */}
      <div className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-1 flex items-center gap-1">
            <Coins className="w-3 h-3" /> Transferred Amount
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isSent ? 'text-white' : 'text-emerald-400'
              }`}
            >
              {isSent ? '-' : '+'}
              {tx.formattedAmount}
            </span>
            <span className="text-lg sm:text-xl font-bold text-zinc-300">
              {tx.token.symbol}
            </span>
          </div>
        </div>

        <div className="sm:text-right">
          <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
            {tx.token.name || tx.token.symbol}
          </span>
          {tx.formattedDate && (
            <div className="text-[11px] text-zinc-500 mt-1 font-mono">
              {tx.formattedDate}
            </div>
          )}
        </div>
      </div>

      {/* Metadata Grid: From, To, Hash */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-zinc-800/70 text-xs">
        {/* From Address */}
        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">From</span>
            <span
              className={`font-mono text-xs truncate block ${
                tx.fromAddress.toLowerCase() === queriedAddress.toLowerCase()
                  ? 'text-amber-400 font-semibold'
                  : 'text-zinc-300'
              }`}
            >
              {shortenAddress(tx.fromAddress, 7, 5)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(tx.fromAddress, `from-${tx.id}`)}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Copy From address"
          >
            {copiedField === `from-${tx.id}` ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-1">
                <Check className="w-3 h-3" /> Copied ✓
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* To Address */}
        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">To</span>
            <span
              className={`font-mono text-xs truncate block ${
                tx.toAddress.toLowerCase() === queriedAddress.toLowerCase()
                  ? 'text-emerald-400 font-semibold'
                  : 'text-zinc-300'
              }`}
            >
              {shortenAddress(tx.toAddress, 7, 5)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(tx.toAddress, `to-${tx.id}`)}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Copy To address"
          >
            {copiedField === `to-${tx.id}` ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-1">
                <Check className="w-3 h-3" /> Copied ✓
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Footer Row: Transaction Hash & Explorer Link */}
      <div className="mt-3 pt-3 border-t border-zinc-800/50 flex flex-wrap items-center justify-between gap-2.5">
        {/* Hash */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-semibold flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" /> Tx:
          </span>
          <span className="font-mono text-zinc-300">
            {shortenHash(tx.hash, 8, 6)}
          </span>
          <button
            type="button"
            onClick={() => handleCopy(tx.hash, `hash-${tx.id}`)}
            className="p-1 rounded text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Copy transaction hash"
          >
            {copiedField === `hash-${tx.id}` ? (
              <span className="text-[10px] text-emerald-400 font-semibold">Copied ✓</span>
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Explorer Button */}
        <a
          href={tx.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 text-xs font-semibold text-zinc-200 hover:text-white border border-zinc-700/60 hover:border-zinc-500 transition-all cursor-pointer select-none group"
        >
          <span>View on Explorer</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};
