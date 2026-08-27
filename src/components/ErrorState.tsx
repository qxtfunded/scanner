import React from 'react';
import { AlertTriangle, RefreshCw, Key } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  onOpenSettings?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to fetch transactions right now. Please try again.',
  onRetry,
  onOpenSettings,
}) => {
  const isApiKeyError = message.toLowerCase().includes('api key') || message.toLowerCase().includes('bscscan');

  return (
    <div
      id="error-state"
      className="w-full max-w-2xl mx-auto mt-8 sm:mt-10 p-6 sm:p-8 rounded-3xl bg-red-950/20 border border-red-900/40 text-center backdrop-blur-md animate-fadeIn"
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center text-red-400 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">Query Notice</h3>
      <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed mb-6">
        {message}
      </p>

      <div className="flex items-center justify-center gap-3">
        {isApiKeyError && onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs sm:text-sm font-bold text-zinc-950 transition-all cursor-pointer select-none active:scale-95 shadow-md"
          >
            <Key className="w-4 h-4" />
            <span>Configure API Key</span>
          </button>
        )}

        <button
          id="retry-search-btn"
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs sm:text-sm font-semibold text-white border border-zinc-700 transition-all cursor-pointer select-none active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};
