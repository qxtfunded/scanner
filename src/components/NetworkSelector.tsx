import React from 'react';
import { motion } from 'motion/react';
import { BlockchainNetwork } from '../types';

interface NetworkSelectorProps {
  selectedNetwork: BlockchainNetwork;
  onSelectNetwork: (network: BlockchainNetwork) => void;
  disabled?: boolean;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onSelectNetwork,
  disabled = false,
}) => {
  return (
    <div
      id="network-selector-container"
      className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-inner"
    >
      {/* BEP-20 Option */}
      <button
        id="network-btn-bep20"
        type="button"
        disabled={disabled}
        onClick={() => onSelectNetwork('BEP-20')}
        className={`relative flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
          selectedNetwork === 'BEP-20'
            ? 'text-amber-300 bg-amber-500/10 border border-amber-500/40 shadow-[0_0_15px_rgba(240,185,11,0.2)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
        }`}
      >
        {/* BNB Icon */}
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
            selectedNetwork === 'BEP-20'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          🔶
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold leading-none">BEP-20</span>
          <span className="text-[10px] text-zinc-400 hidden sm:inline-block font-normal mt-0.5">
            BNB Smart Chain
          </span>
        </div>

        {selectedNetwork === 'BEP-20' && (
          <motion.div
            layoutId="network-active-indicator"
            className="absolute inset-0 rounded-xl border-2 border-amber-400/50 pointer-events-none"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </button>

      {/* TRC-20 Option */}
      <button
        id="network-btn-trc20"
        type="button"
        disabled={disabled}
        onClick={() => onSelectNetwork('TRC-20')}
        className={`relative flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
          selectedNetwork === 'TRC-20'
            ? 'text-red-300 bg-red-500/10 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
        }`}
      >
        {/* TRON Icon */}
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
            selectedNetwork === 'TRC-20'
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          🔺
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold leading-none">TRC-20</span>
          <span className="text-[10px] text-zinc-400 hidden sm:inline-block font-normal mt-0.5">
            TRON Network
          </span>
        </div>

        {selectedNetwork === 'TRC-20' && (
          <motion.div
            layoutId="network-active-indicator"
            className="absolute inset-0 rounded-xl border-2 border-red-400/50 pointer-events-none"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </button>
    </div>
  );
};
