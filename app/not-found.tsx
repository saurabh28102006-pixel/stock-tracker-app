import React from 'react';
import Link from 'next/link';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c10] text-gray-100 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20">
        <Compass className="h-8 w-8 animate-spin" style={{ animationDuration: '8s' }} />
      </div>

      <span className="text-emerald-400 font-mono text-sm font-bold tracking-widest uppercase mb-2">
        404 — Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-gray-100 tracking-tight">
        Market Ticker or Route Unavailable
      </h1>

      <p className="text-gray-400 text-sm sm:text-base max-w-md mt-3 leading-relaxed">
        The page or asset you are looking for does not exist or has been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-bold text-black hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <Link
          href="/screener"
          className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-3 text-sm font-semibold text-gray-300 hover:border-gray-700 hover:text-white transition-colors"
        >
          Explore Screener
        </Link>
      </div>
    </div>
  );
}