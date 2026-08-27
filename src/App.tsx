/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BlockchainNetwork, SearchHistoryItem, TransactionQueryResponse } from './types';
import { validateWalletAddress } from './utils/validation';
import { fetchWalletTransactions } from './services/api';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { WalletSearch } from './components/WalletSearch';
import { TransactionList } from './components/TransactionList';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { EmptyState } from './components/EmptyState';
import { NoTransactionsState } from './components/NoTransactionsState';
import { ErrorState } from './components/ErrorState';
import { Footer } from './components/Footer';

const STORAGE_KEY = 'chaintrack_recent_searches_v1';

export default function App() {
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>('BEP-20');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [results, setResults] = useState<TransactionQueryResponse | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Save history helper
  const saveSearchToHistory = (address: string, network: BlockchainNetwork) => {
    try {
      const newItem: SearchHistoryItem = {
        address: address.trim(),
        network,
        timestamp: Date.now(),
      };

      setRecentSearches((prev) => {
        // Remove duplicate if exists
        const filtered = prev.filter(
          (item) => !(item.address.toLowerCase() === newItem.address.toLowerCase() && item.network === newItem.network)
        );
        const updated = [newItem, ...filtered].slice(0, 5);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore storage write errors
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleRemoveRecentItem = (index: number) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  // Network Switch Handler
  const handleNetworkChange = (newNetwork: BlockchainNetwork) => {
    if (newNetwork === selectedNetwork) return;

    setSelectedNetwork(newNetwork);
    // Clear old results to prevent mixing BSC and TRON results
    setResults(null);
    setHasSearched(false);
    setApiError(null);
    setValidationError(null);
  };

  // Main Search Execution
  const executeSearch = useCallback(
    async (targetAddress?: string, targetNetwork?: BlockchainNetwork) => {
      const addr = (targetAddress || walletAddress).trim();
      const net = targetNetwork || selectedNetwork;

      setValidationError(null);
      setApiError(null);

      // Client-side address validation
      const validation = validateWalletAddress(addr, net);
      if (!validation.isValid) {
        setValidationError(validation.errorMessage || 'Invalid wallet address.');
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      setResults(null);

      try {
        const data = await fetchWalletTransactions(addr, net);
        setResults(data);
        saveSearchToHistory(addr, net);
      } catch (err: any) {
        setApiError(err.message || 'Unable to fetch transactions right now. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, selectedNetwork]
  );

  // Trigger from sample address
  const handleSelectSampleAddress = (address: string, network: BlockchainNetwork) => {
    setWalletAddress(address);
    setSelectedNetwork(network);
    setValidationError(null);
    setApiError(null);
    executeSearch(address, network);
  };

  // Trigger from recent history
  const handleSelectRecent = (item: SearchHistoryItem) => {
    setWalletAddress(item.address);
    setSelectedNetwork(item.network);
    setValidationError(null);
    setApiError(null);
    executeSearch(item.address, item.network);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090B0E] text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200 antialiased font-sans">
      {/* Glow effect in background */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-20 -z-10 transition-all duration-700"
        style={{
          backgroundColor: selectedNetwork === 'BEP-20' ? '#F0B90B' : '#EF4444',
        }}
      />

      {/* Header */}
      <Header selectedNetwork={selectedNetwork} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Search Panel */}
        <div className="mt-6 sm:mt-8">
          <WalletSearch
            address={walletAddress}
            setAddress={setWalletAddress}
            network={selectedNetwork}
            onNetworkChange={handleNetworkChange}
            onSearch={() => executeSearch()}
            isLoading={isLoading}
            validationError={validationError}
            setValidationError={setValidationError}
            recentSearches={recentSearches}
            onSelectRecent={handleSelectRecent}
            onClearRecent={handleClearRecent}
            onRemoveRecentItem={handleRemoveRecentItem}
          />
        </div>

        {/* View States */}
        {isLoading && <LoadingSkeleton network={selectedNetwork} />}

        {!isLoading && apiError && (
          <ErrorState message={apiError} onRetry={() => executeSearch()} />
        )}

        {!isLoading && !apiError && hasSearched && results && results.transactions.length > 0 && (
          <TransactionList
            network={results.network}
            walletAddress={results.walletAddress}
            transactions={results.transactions}
          />
        )}

        {!isLoading && !apiError && hasSearched && results && results.transactions.length === 0 && (
          <NoTransactionsState
            network={results.network}
            walletAddress={results.walletAddress}
          />
        )}

        {!isLoading && !apiError && !hasSearched && (
          <EmptyState
            currentNetwork={selectedNetwork}
            onSelectSampleAddress={handleSelectSampleAddress}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
