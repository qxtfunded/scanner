import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to fetch transactions right now. Please try again.',
  onRetry,
}) => {
  return (
    <div
      id="error-state"
      className="w-full max-w-2xl mx-auto mt-8 sm:mt-10 p-8 rounded-3xl bg-red-950/20 border border-red-900/40 text-center backdrop-blur-md animate-fadeIn"
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center text-red-400 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">Query Failed</h3>
      <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed mb-6">
        {message}
      </p>

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
  );
};
