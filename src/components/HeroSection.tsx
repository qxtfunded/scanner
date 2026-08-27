import React from 'react';
import { ShieldCheck, Zap, ArrowRightLeft } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section id="hero-section" className="text-center pt-8 pb-4 px-4">
      {/* Top feature tags */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-zinc-400 mb-4 shadow-sm">
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <Zap className="w-3.5 h-3.5" /> Instant Tracker
        </span>
        <span className="text-zinc-600">•</span>
        <span>Latest 3 Token Transfers</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
        Track Wallet Transactions
      </h1>

      <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
        Enter a wallet address to instantly view its latest token activity.
      </p>
    </section>
  );
};
