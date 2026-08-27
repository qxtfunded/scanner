import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="w-full border-t border-zinc-900 bg-zinc-950/80 py-8 px-4 mt-16 text-center text-xs text-zinc-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-400">ChainTrack</span>
          <span>•</span>
          <span>BEP-20 &amp; TRC-20 Real-Time Token Transfer Tracker</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://bscscan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
          >
            <span>BscScan</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://tronscan.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
          >
            <span>TronScan</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};
