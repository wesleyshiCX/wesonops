// app/page.tsx
import Link from 'next/link';
import { Github } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#3a2a1a] p-8 md:p-24">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold mb-4">WesonOps</h1>
          <p className="text-xl max-w-2xl text-[#3a2a1a]/90">
            Designing human-centered support infrastructures. Helping organizations
            scale expertise through intelligent augmentation and operational architecture.
          </p>
        </header>

        {/* Tools & Projects Grid */}
        <section>
          <h2 className="text-[#bc6a4c] text-xs font-black uppercase tracking-widest mb-6">
            Interactive Tooling Portfolio
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* CX Debt Calculator Card */}
            <div className="bg-white border border-[#3a2a1a]/10 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#bc6a4c] mb-2 font-mono">
                Featured Framework
              </h2>
              <h3 className="text-2xl font-semibold mb-4 text-[#3a2a1a]">
                CX Debt Calculator
              </h3>
              <p className="mb-6 text-sm opacity-80 flex-grow">
                A specialized tool to quantify operational friction. Calculate the
                compounding, hidden cost of old backlogs to move finance-level metrics.
              </p>
              <a
                href="https://cxdebt.co"
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-[#264653] text-[#f5f1eb] px-6 py-2.5 rounded hover:opacity-90 transition-opacity font-medium text-center text-sm"
              >
                Launch Calculator
              </a>
            </div>

            {/* AI Deflection Cost Studio Card — UPDATED */}
            <div className="bg-white border border-[#264653]/30 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col border-t-4 border-[#264653]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#264653] font-mono">
                  Interactive Model
                </h2>
                <a
                  href="https://github.com/wesleyshiCX/ai-deflection-cost-studio"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#3a2a1a]/40 hover:text-[#264653] transition-colors uppercase tracking-wider"
                >
                  <Github className="w-3 h-3" />
                  Source
                </a>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-[#3a2a1a]">
                AI Deflection Cost Studio
              </h3>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#264653]/60 mb-3 font-mono">
                Total Economic Impact Platform — v2.0
              </p>
              <p className="mb-6 text-sm opacity-80 flex-grow">
                A CFO-defensible TEI modeling platform for AI support deflection.
                Models direct savings, churn revenue preservation, FTE reclaimed,
                production infrastructure costs, and risk-adjusted ROI with
                conservative, base, and optimistic scenario modes.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/tools/llm-cost-calculator"
                  className="inline-block bg-[#264653] text-white px-6 py-2.5 rounded hover:opacity-90 transition-opacity font-medium text-center text-sm"
                >
                  Launch Studio
                </Link>
                <a
                  href="https://github.com/wesleyshiCX/ai-deflection-cost-studio"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-[#264653]/30 text-[#264653] px-6 py-2 rounded hover:bg-[#264653]/5 transition-colors font-medium text-center text-xs"
                >
                  <Github className="w-3.5 h-3.5" />
                  View Source on GitHub
                </a>
              </div>
            </div>

            {/* Compliance Auditor Card */}
            <div className="bg-white border border-[#3a2a1a]/10 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col border-t-4 border-[#d4a017]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#d4a017] mb-2 font-mono">
                New Agent
              </h2>
              <h3 className="text-2xl font-semibold mb-4 text-[#3a2a1a]">
                Compliance Auditor
              </h3>
              <p className="mb-6 text-sm opacity-80 flex-grow">
                An agentic workflow that translates raw tickets into audit-ready RCA
                documents. Enforces data integrity and SOC2 compliance via a
                gatekeeping architecture.
              </p>
              <a
                href="https://www.loom.com/share/ac4fe97291e44cfe9e07f910435b3031"
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-[#3a2a1a] text-[#f5f1eb] px-6 py-2.5 rounded hover:opacity-90 transition-opacity font-medium text-center text-sm"
              >
                Watch the Demo
              </a>
            </div>

            {/* Job Search OS Card */}
            <div className="bg-white border border-[#3a2a1a]/10 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col border-t-4 border-[#06c3a]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#06c3a] mb-2 font-mono">
                Open Source Tool
              </h2>
              <h3 className="text-2xl font-semibold mb-4 text-[#3a2a1a]">
                Job Search OS
              </h3>
              <p className="mb-6 text-sm opacity-80 flex-grow">
                An AI-powered workspace for active job seekers. Manage applications,
                tailor resumes via embeddings, and track recruiter interactions.
                Fork and deploy on Vercel.
              </p>
              <Link
                href="/tools/job-search-os"
                className="inline-block bg-[#3a2a1a] text-[#f5f1eb] px-6 py-2.5 rounded hover:opacity-90 transition-opacity font-medium text-center text-sm"
              >
                View Project
              </Link>
            </div>

          </div>
        </section>

        {/* Skills / Focus Areas */}
        <section className="grid md:grid-cols-2 gap-8 pt-6 border-t border-[#3a2a1a]/10">
          <div className="border-l-4 border-[#6a8c9c] pl-6">
            <h4 className="font-bold text-lg mb-2 text-[#3a2a1a]">Operational Design</h4>
            <p className="text-sm text-[#3a2a1a]/80">
              Architecting Tier 1-3 tiered structures that empower agents instead
              of forcing technical friction.
            </p>
          </div>
          <div className="border-l-4 border-[#d4a017] pl-6">
            <h4 className="font-bold text-lg mb-2 text-[#3a2a1a]">Human-AI Augmentation</h4>
            <p className="text-sm text-[#3a2a1a]/80">
              Implementing systemic co-pilot environments that leverage
              institutional knowledge.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
