import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Check, Shield } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const USER_KEYS_STORAGE_KEY = 'chaintrack_custom_keys_v1';

export interface UserCustomKeys {
  bscScanKey?: string;
  tronGridKey?: string;
}

export function getUserCustomKeys(): UserCustomKeys {
  try {
    const saved = localStorage.getItem(USER_KEYS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore
  }
  return {};
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [bscKey, setBscKey] = useState('');
  const [tronKey, setTronKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const keys = getUserCustomKeys();
      setBscKey(keys.bscScanKey || '');
      setTronKey(keys.tronGridKey || '');
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data: UserCustomKeys = {
      bscScanKey: bscKey.trim(),
      tronGridKey: tronKey.trim(),
    };
    try {
      localStorage.setItem(USER_KEYS_STORAGE_KEY, JSON.stringify(data));
      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to save API keys:', err);
    }
  };

  const handleClear = () => {
    setBscKey('');
    setTronKey('');
    try {
      localStorage.removeItem(USER_KEYS_STORAGE_KEY);
      setSavedSuccess(true);
      if (onSaved) onSaved();
    } catch {
      // Ignore
    }
  };

  return (
    <div
      id="api-key-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="api-key-modal-content"
        className="w-full max-w-lg rounded-3xl bg-[#111419] border border-zinc-800 p-6 sm:p-7 shadow-2xl relative text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">API Keys Configuration</h3>
              <p className="text-xs text-zinc-400">Add free API keys to bypass rate limits on Vercel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <div className="mt-4 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Keys are saved locally in your browser's <strong className="text-white">localStorage</strong>. They are never sent to any third-party server.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* BscScan Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-200">
                BscScan / Etherscan API Key (BEP-20)
              </label>
              <a
                href="https://bscscan.com/myapikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 hover:underline"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="text"
              value={bscKey}
              onChange={(e) => setBscKey(e.target.value)}
              placeholder="e.g. 5D8XXXX... or leave empty"
              className="w-full h-11 px-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-mono text-white placeholder-zinc-600 outline-none transition-colors"
            />
          </div>

          {/* TronGrid Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-200">
                TronGrid API Key (TRC-20)
              </label>
              <a
                href="https://www.trongrid.io/dashboard/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-red-400 hover:text-red-300 inline-flex items-center gap-1 hover:underline"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="text"
              value={tronKey}
              onChange={(e) => setTronKey(e.target.value)}
              placeholder="e.g. your-trongrid-key or leave empty"
              className="w-full h-11 px-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs font-mono text-white placeholder-zinc-600 outline-none transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            >
              Clear Keys
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-zinc-950 inline-flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Keys</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
