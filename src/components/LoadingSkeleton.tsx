import React from 'react';
import { Loader2 } from 'lucide-react';
import { BlockchainNetwork } from '../types';

interface LoadingSkeletonProps {
  network: BlockchainNetwork;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ network }) => {
  const isBsc = network === 'BEP-20';

  return (
    <div id="loading-skeleton-container" className="w-full max-w-4xl mx-auto mt-8 sm:mt-10 space-y-4">
      {/* Loading state indicator */}
      <div className="flex items-center justify-center gap-2.5 py-3 text-xs sm:text-sm font-medium text-zinc-400">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
        <span>
          Querying {isBsc ? 'BNB Smart Chain (BEP-20)' : 'TRON Network (TRC-20)'} for token transfers...
        </span>
      </div>

      {/* 3 Skeleton Cards */}
      {[1, 2, 3].map((index) => (
        <div
          key={`skeleton-${index}`}
          className="w-full rounded-2xl bg-zinc-900/40 border border-zinc-800/60 p-5 sm:p-6 animate-pulse"
        >
          {/* Top Bar Skeleton */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <div className="w-16 h-6 rounded-lg bg-zinc-800/80" />
              <div className="w-20 h-6 rounded-lg bg-zinc-800/60" />
            </div>
            <div className="w-24 h-4 rounded bg-zinc-800/60" />
          </div>

          {/* Amount Skeleton */}
          <div className="py-5 flex items-baseline justify-between">
            <div className="space-y-2">
              <div className="w-28 h-3 rounded bg-zinc-800/40" />
              <div className="w-48 h-8 rounded-lg bg-zinc-800/80" />
            </div>
            <div className="w-24 h-6 rounded-md bg-zinc-800/60" />
          </div>

          {/* From / To Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-zinc-800/50">
            <div className="h-12 rounded-xl bg-zinc-800/50" />
            <div className="h-12 rounded-xl bg-zinc-800/50" />
          </div>

          {/* Bottom Bar Skeleton */}
          <div className="mt-3 pt-3 border-t border-zinc-800/30 flex items-center justify-between">
            <div className="w-36 h-4 rounded bg-zinc-800/40" />
            <div className="w-28 h-7 rounded-xl bg-zinc-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
};
