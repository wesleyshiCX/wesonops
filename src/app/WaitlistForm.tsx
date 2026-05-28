"use client";
import { useState } from "react";

export default function EmailGate() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Submit to your Activepieces webhook here...
    // alert("Diagnosis sent to your inbox!");
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#3a2a1a]/10 my-12">
      <h2 className="text-2xl font-bold mb-3 text-[#264653]">Want the WesOnOps Auditor diagnosis?</h2>
      <p className="mb-6 opacity-80">
        Enter your email to unlock access to the Compliance Agent and get my 
        <strong> secret support-scaling formula</strong> in your inbox.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <input
          type="email"
          required
          placeholder="your@email.com"
          className="flex-grow p-3 border border-[#3a2a1a]/20 rounded-lg"
        />
        <button type="submit" className="bg-[#bc6a4c] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#a66d40] transition">
          {loading ? "Diagnosing..." : "Get My Full Diagnosis"}
        </button>
      </form>
      <p className="text-xs opacity-60 mt-4">No spam. Just professional ops infrastructure advice.</p>
    </div>
  );
}
