import React from 'react';
import { Layers, Activity, ShieldCheck } from 'lucide-react';
import { BlockchainNetwork } from '../types';
import { NETWORKS } from '../utils/formatters';

interface HeaderProps {
  selectedNetwork: BlockchainNetwork;
}

export const Header: React.FC<HeaderProps> = ({ selectedNetwork }) => {
  const currentNetworkConfig = NETWORKS[selectedNetwork];
  const isBsc = selectedNetwork === 'BEP-20';

  return (
    <header id="main-header" className="w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div id="brand-logo" className="flex items-center gap-3 group cursor-pointer select-none">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/60 shadow-inner group-hover:border-zinc-500 transition-colors">
            <Layers className="w-5 h-5 text-zinc-100" />
            <div
              className="absolute -inset-0.5 rounded-xl opacity-30 blur-[6px] transition-opacity group-hover:opacity-60"
              style={{
                backgroundColor: isBsc ? '#F0B90B' : '#EF4444',
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              ChainTrack
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                PRO
              </span>
            </span>
          </div>
        </div>

        {/* Network Status Indicator */}
        <div id="network-status-indicator" className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{
                  backgroundColor: isBsc ? '#F0B90B' : '#EF4444',
                }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{
                  backgroundColor: isBsc ? '#F0B90B' : '#EF4444',
                }}
              />
            </span>
            <span className="font-semibold text-white">
              {isBsc ? 'BSC Mainnet' : 'TRON Mainnet'}
            </span>
            <span className="text-zinc-500 text-[11px] hidden sm:inline-block">• Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
