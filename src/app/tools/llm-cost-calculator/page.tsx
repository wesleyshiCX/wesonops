'use client';

import LLMCostDashboard from '@/components/LLMCostDashboard';
import Link from 'next/link';

export default function LLMCostPage() {
  return (
    <div className="min-h-screen bg-[#f5f1eb] py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Simple cohesive breadcrumb back to portfolio home */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="text-sm font-semibold text-[#bc6a4c] hover:underline"
          >
            &larr; Back to WesonOps Home
          </Link>
        </div>
        <LLMCostDashboard />
      </div>
    </div>
  );
}
