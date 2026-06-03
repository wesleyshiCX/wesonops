import Link from 'next/link';

export default function JobSearchOSPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#3a2a1a] p-8 md:p-24">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm font-semibold hover:underline mb-8 block">&larr; Back to Portfolio</Link>
        
        <h1 className="text-5xl font-bold mb-6">Job Search OS</h1>
        <p className="text-xl mb-12 opacity-80">
          Treat your job hunt like a product launch. An AI-powered workspace built for high-signal, low-friction application management.
        </p>

        {/* Deployment Section */}
        <div className="mb-16 p-8 bg-[#3a2a1a] text-[#f5f1eb] rounded-lg">
          <h2 className="text-xl font-bold mb-4">Deploy for yourself</h2>
          <p className="mb-6 opacity-80">This tool is designed for private use. You can fork the repository and deploy it to your own Vercel instance in under 5 minutes.</p>
          <a 
            href="https://github.com/wesleyshiCX/job-search-os" 
            target="_blank"
            className="bg-[#bc6a4c] text-white px-8 py-3 rounded font-medium hover:opacity-90"
          >
            Fork on GitHub
          </a>
        </div>

        {/* Feature Highlights */}
        <section className="space-y-16">
          {[
            { title: "Smart Resume Matching", desc: "Upload your resume once. The tool uses vector embeddings to auto-match your experience against every new JD you paste.", img: "resumes-placeholder" },
            { title: "Kanban Pipeline", desc: "Track your funnel from initial application to final offer with drag-and-drop ease.", img: "kanban-placeholder" }
          ].map((feature, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-8 items-center border-b border-[#3a2a1a]/10 pb-16">
              <div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="opacity-80">{feature.desc}</p>
              </div>
              <div className="bg-[#e0dcd5] aspect-video rounded-lg flex items-center justify-center border-2 border-dashed border-[#3a2a1a]/20">
                <span className="text-[#3a2a1a]/40 font-mono text-xs text-center p-4">
                  [ Screenshot: {feature.title} <br/> 16:9 Aspect Ratio Required ]
                </span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
