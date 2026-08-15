import React from 'react';
import CompareClient from '@/components/CompareClient';
import { ArrowRightLeft } from 'lucide-react';

export default function ComparePage() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="border-b border-gray-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 flex items-center gap-2.5">
          <ArrowRightLeft className="h-7 w-7 text-emerald-400" />
          Stock Comparison Tool
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Side-by-side fundamentals & Gemini AI quantitative verdict for any two stocks.
        </p>
      </div>

      <CompareClient />
    </div>
  );
}
