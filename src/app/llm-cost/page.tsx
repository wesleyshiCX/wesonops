import Link from 'next/link';
import LLMCostDashboard from '@/components/llm-cost/LLMCostDashboard';

// Server component — no 'use client' needed here. The dashboard itself is
// a client component; keeping the page on the server improves initial load.

export const metadata = {
  title: 'AI Deflection TCO Studio | WesonOps',
  description: 'Total Economic Impact modeling for AI support deflection with defensible ROI math.',
};

export default function LLMCostPage() {
  return (
    <div className="min-h-screen bg-[#f5f1eb] py-8 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <Link href="/" className="text-sm font-semibold text-[#bc6a4c] hover:underline">
            &larr; Back to WesonOps Home
          </Link>
        </div>
        <LLMCostDashboard />
      </div>
    </div>
  );
}
