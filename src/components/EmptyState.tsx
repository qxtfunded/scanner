import React from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { BlockchainNetwork } from '../types';

interface EmptyStateProps {
  currentNetwork: BlockchainNetwork;
  onSelectSampleAddress: (address: string, network: BlockchainNetwork) => void;
}

const SAMPLE_ADDRESSES = {
  'BEP-20': [
    {
      label: 'Binance Hot Wallet (BSC)',
      address: '0x8894e0a0c962cb723c1976a4421c95949be2d4e3',
      desc: 'Active BSC wallet with high BEP-20 token activity',
    },
    {
      label: 'PancakeSwap Router',
      address: '0x10ed43c718714eb63d5aa57b78b54704e256024e',
      desc: 'DEX router with frequent token transfers',
    },
  ],
  'TRC-20': [
    {
      label: 'TRON Binance Wallet',
      address: 'TMuA6YqfCeX8EhbfYEg5y7S4DqzSJireY9',
      desc: 'Active TRON account with frequent TRC-20 transfers',
    },
    {
      label: 'Active TRON Trader',
      address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      desc: 'USDT TRC-20 contract address',
    },
  ],
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  currentNetwork,
  onSelectSampleAddress,
}) => {
  const samples = SAMPLE_ADDRESSES[currentNetwork];
  const isBsc = currentNetwork === 'BEP-20';

  return (
    <div
      id="empty-state"
      className="w-full max-w-2xl mx-auto mt-10 p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-center backdrop-blur-md"
    >
      <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 mx-auto flex items-center justify-center text-zinc-400 mb-4 shadow-inner">
        <Search className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-bold text-white mb-1">No transactions yet</h3>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
        Enter a wallet address above to check blockchain activity.
      </p>

      {/* Quick Sample Addresses for 1-Click Testing */}
      <div className="pt-6 border-t border-zinc-800/70 text-left">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-3 flex items-center gap-1.5 justify-center">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span>Or try a sample {currentNetwork} wallet</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {samples.map((sample) => (
            <button
              key={sample.address}
              type="button"
              onClick={() => onSelectSampleAddress(sample.address, currentNetwork)}
              className="p-3 rounded-xl bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-200 group-hover:text-white mb-1">
                  <span>{sample.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-zinc-500 line-clamp-1">{sample.desc}</div>
              </div>
              <div className="mt-2 font-mono text-[10px] text-zinc-400 truncate bg-zinc-900 px-2 py-1 rounded">
                {sample.address}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
