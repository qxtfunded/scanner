import React, { useState } from 'react';
import { Search, Clipboard, Loader2, AlertCircle, X, Sparkles } from 'lucide-react';
import { BlockchainNetwork, SearchHistoryItem } from '../types';
import { NETWORKS } from '../utils/formatters';
import { NetworkSelector } from './NetworkSelector';
import { RecentSearches } from './RecentSearches';

interface WalletSearchProps {
  address: string;
  setAddress: (address: string) => void;
  network: BlockchainNetwork;
  onNetworkChange: (network: BlockchainNetwork) => void;
  onSearch: () => void;
  isLoading: boolean;
  validationError: string | null;
  setValidationError: (err: string | null) => void;
  recentSearches: SearchHistoryItem[];
  onSelectRecent: (item: SearchHistoryItem) => void;
  onClearRecent: () => void;
  onRemoveRecentItem: (index: number) => void;
}

export const WalletSearch: React.FC<WalletSearchProps> = ({
  address,
  setAddress,
  network,
  onNetworkChange,
  onSearch,
  isLoading,
  validationError,
  setValidationError,
  recentSearches,
  onSelectRecent,
  onClearRecent,
  onRemoveRecentItem,
}) => {
  const [pasteToast, setPasteToast] = useState<string | null>(null);
  const currentNetwork = NETWORKS[network];
  const isBsc = network === 'BEP-20';

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        setPasteToast('Clipboard access unavailable. Please paste manually.');
        setTimeout(() => setPasteToast(null), 2500);
        return;
      }

      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const clean = text.trim();
        setAddress(clean);
        setValidationError(null);
        setPasteToast('Address pasted ✓');
        setTimeout(() => setPasteToast(null), 1500);
      } else {
        setPasteToast('Clipboard is empty');
        setTimeout(() => setPasteToast(null), 1500);
      }
    } catch {
      setPasteToast('Permission denied to read clipboard');
      setTimeout(() => setPasteToast(null), 2500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      onSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <div
      id="search-panel"
      className="w-full max-w-2xl mx-auto rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300"
      style={{
        boxShadow: isBsc
          ? '0 10px 40px -10px rgba(240, 185, 11, 0.08), 0 0 0 1px rgba(240, 185, 11, 0.15)'
          : '0 10px 40px -10px rgba(239, 68, 68, 0.08), 0 0 0 1px rgba(239, 68, 68, 0.15)',
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="space-y-4"
      >
        {/* Network Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Select Blockchain Network
          </label>
          <NetworkSelector
            selectedNetwork={network}
            onSelectNetwork={onNetworkChange}
            disabled={isLoading}
          />
        </div>

        {/* Wallet Address Input Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="wallet-address-input"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-zinc-500" /> Wallet Address
            </label>
            <span className="text-[11px] text-zinc-500 font-mono">
              {network === 'BEP-20' ? 'Format: 0x... (42 chars)' : 'Format: T... (34 chars)'}
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              id="wallet-address-input"
              type="text"
              value={address}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={currentNetwork.placeholder}
              disabled={isLoading}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              className={`w-full bg-zinc-950/90 text-white placeholder-zinc-600 font-mono text-sm sm:text-base rounded-2xl pl-4 pr-24 py-3.5 sm:py-4 border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                validationError
                  ? 'border-red-500/80 focus:ring-red-500/30'
                  : isBsc
                  ? 'border-zinc-800 focus:border-amber-500/60 focus:ring-amber-500/20'
                  : 'border-zinc-800 focus:border-red-500/60 focus:ring-red-500/20'
              }`}
            />

            {/* Action buttons inside input */}
            <div className="absolute right-2 flex items-center gap-1.5">
              {address && (
                <button
                  id="clear-address-input-btn"
                  type="button"
                  onClick={() => {
                    setAddress('');
                    setValidationError(null);
                  }}
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                id="paste-address-btn"
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1 text-xs font-semibold py-1.5 px-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all cursor-pointer select-none active:scale-95"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            </div>
          </div>

          {/* Toast / Paste notification */}
          {pasteToast && (
            <div className="mt-1.5 text-[11px] text-zinc-400 italic">
              {pasteToast}
            </div>
          )}

          {/* Inline Validation Error Banner */}
          {validationError && (
            <div
              id="address-validation-error"
              className="mt-2.5 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-medium animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          id="check-transactions-btn"
          type="submit"
          disabled={isLoading}
          className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed select-none ${
            isBsc
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 hover:brightness-110 shadow-amber-500/20'
              : 'bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white hover:brightness-110 shadow-red-500/20'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Check Transactions</span>
            </>
          )}
        </button>

        {/* Local History: Recent Searches */}
        <RecentSearches
          history={recentSearches}
          onSelect={onSelectRecent}
          onClearAll={onClearRecent}
          onRemoveItem={onRemoveRecentItem}
        />
      </form>
    </div>
  );
};
