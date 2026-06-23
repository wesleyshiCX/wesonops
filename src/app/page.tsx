// app/page.tsx
import Link from 'next/link';

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

            {/* AI Deflection TCO Studio Card */}
            <div className="bg-white border border-[#264653]/30 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col border-t-4 border-[#264653]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#264653] font-mono">
                  Interactive Model
                </h2>
                <a
                  href="https://github.com/wesleyshiCX/ai-deflection-tco-studio"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#3a2a1a]/40 hover:text-[#264653] transition-colors uppercase tracking-wider"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Source
                </a>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-[#3a2a1a]">
                AI Deflection TCO Studio
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
                  href="/llm-cost"
                  className="inline-block bg-[#264653] text-white px-6 py-2.5 rounded hover:opacity-90 transition-opacity font-medium text-center text-sm"
                >
                  Launch Studio
                </Link>
                <a
                  href="https://github.com/your-username/ai-deflection-tco-studio"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-[#264653]/30 text-[#264653] px-6 py-2 rounded hover:bg-[#264653]/5 transition-colors font-medium text-center text-xs"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
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
