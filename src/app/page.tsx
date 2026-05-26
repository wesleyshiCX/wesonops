// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#3a2a1a] p-8 md:p-24">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold mb-4">WesonOps</h1>
          <p className="text-xl max-w-2xl">
            Designing human-centered support infrastructures. Helping organizations scale expertise through intelligent augmentation and operational architecture.
          </p>
        </header>

        {/* Featured Project Card */}
        <section className="bg-white border border-[#3a2a1a]/10 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#bc6a4c] mb-2">Featured Project</h2>
          <h3 className="text-2xl font-semibold mb-4">CX Debt Calculator</h3>
          <p className="mb-6 opacity-80">
            A specialized tool to quantify operational friction. Calculate the hidden cost of manual processes to justify high-impact, human-centric tooling upgrades.
          </p>
          <a 
            href="https://cxdebt.co" 
            target="_blank" 
            className="inline-block bg-[#264653] text-white px-6 py-2 rounded hover:opacity-90 transition-opacity font-medium"
          >
            Launch Calculator
          </a>
        </section>

        {/* Skills/Focus Areas */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="border-l-4 border-[#6a8c9c] pl-6">
            <h4 className="font-bold text-lg mb-2">Operational Design</h4>
            <p>Architecting Tier 1-3 tiered structures that empower agents instead of replacing them.</p>
          </div>
          <div className="border-l-4 border-[#d4a017] pl-6">
            <h4 className="font-bold text-lg mb-2">Human-AI Augmentation</h4>
            <p>Implementing systemic "co-pilot" environments that leverage institutional knowledge.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
