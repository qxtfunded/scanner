import React from 'react';
import { History, X, ArrowUpRight, Trash2 } from 'lucide-react';
import { SearchHistoryItem, BlockchainNetwork } from '../types';
import { shortenAddress } from '../utils/formatters';

interface RecentSearchesProps {
  history: SearchHistoryItem[];
  onSelect: (item: SearchHistoryItem) => void;
  onClearAll: () => void;
  onRemoveItem: (index: number) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  history,
  onSelect,
  onClearAll,
  onRemoveItem,
}) => {
  if (!history || history.length === 0) return null;

  return (
    <div id="recent-searches-section" className="mt-4 pt-3 border-t border-zinc-800/60">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" /> Recent Searches
        </span>
        <button
          id="clear-recent-searches-btn"
          type="button"
          onClick={onClearAll}
          className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer py-1 px-1.5 rounded hover:bg-zinc-900"
          title="Clear all recent searches"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {history.map((item, idx) => {
          const isBsc = item.network === 'BEP-20';
          return (
            <div
              key={`${item.network}-${item.address}-${idx}`}
              className="inline-flex items-center rounded-lg bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 text-xs text-zinc-300 transition-all hover:bg-zinc-850 group"
            >
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="flex items-center gap-1.5 py-1.5 pl-2.5 pr-2 cursor-pointer text-left"
                title={`Search ${item.address} on ${item.network}`}
              >
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none ${
                    isBsc
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {item.network}
                </span>
                <span className="font-mono text-zinc-300 group-hover:text-white transition-colors">
                  {shortenAddress(item.address, 5, 4)}
                </span>
                <ArrowUpRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(idx);
                }}
                className="p-1.5 pr-2 text-zinc-600 hover:text-zinc-300 cursor-pointer transition-colors"
                title="Remove from history"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
