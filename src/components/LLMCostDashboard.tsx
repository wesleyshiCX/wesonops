import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Cpu, 
  Info, 
  Zap, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  LabelList
} from 'recharts';

interface LLMModel {
  name: string;
  provider: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  averageLatencySeconds: number;
  tier: string;
}

const LLM_MODELS: LLMModel[] = [
  { name: 'Gemini 1.5 Flash', provider: 'Google', inputCostPer1M: 0.075, outputCostPer1M: 0.30, averageLatencySeconds: 0.8, tier: 'Tier 1 (Fast/Cheap)' },
  { name: 'GPT-4o Mini', provider: 'OpenAI', inputCostPer1M: 0.15, outputCostPer1M: 0.60, averageLatencySeconds: 1.0, tier: 'Tier 1 (Fast/Cheap)' },
  { name: 'Claude 3.5 Haiku', provider: 'Anthropic', inputCostPer1M: 0.80, outputCostPer1M: 4.00, averageLatencySeconds: 1.2, tier: 'Tier 2 (Balanced)' },
  { name: 'GPT-4o', provider: 'OpenAI', inputCostPer1M: 2.50, outputCostPer1M: 10.00, averageLatencySeconds: 2.1, tier: 'Tier 3 (Reasoning)' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputCostPer1M: 3.00, outputCostPer1M: 15.00, averageLatencySeconds: 2.3, tier: 'Tier 3 (Reasoning)' }
];

export default function LLMCostDashboard() {
  const [ticketVolume, setTicketVolume] = useState<number>(12000);
  const [costPerLiveTicket, setCostPerLiveTicket] = useState<number>(18.50);
  const [deflectionGoal, setDeflectionGoal] = useState<number>(45);
  const [selectedModelName, setSelectedModelName] = useState<string>('GPT-4o Mini');
  
  const [avgPromptTokens, setAvgPromptTokens] = useState<number>(650);
  const [avgCompletionTokens, setAvgCompletionTokens] = useState<number>(250);
  const [avgTurnsPerResolved, setAvgTurnsPerResolved] = useState<number>(4);
  const [avgTurnsBeforeEscalation, setAvgTurnsBeforeEscalation] = useState<number>(2);
  const [monthlyPlatformFee, setMonthlyPlatformFee] = useState<number>(1500);
  const [implementationCost, setImplementationCost] = useState<number>(8000);
   // ADD THIS LINE (Default to $2,500/mo, representing partial allocation of a Support Ops Engineer)
  const [monthlyAIOpsLabor, setMonthlyAIOpsLabor] = useState<number>(2500); ``

  // Automatically updates token profiles and turns based on the selected model's intended use-case
useEffect(() => {
  if (selectedModel.tier.includes('Tier 1')) {
    // Light-weight FAQs / routing
    setAvgPromptTokens(500);
    setAvgCompletionTokens(200);
    setAvgTurnsPerResolved(3);
    setAvgTurnsBeforeEscalation(2);
  } else if (selectedModel.tier.includes('Tier 2')) {
    // Medium diagnostic scenarios
    setAvgPromptTokens(800);
    setAvgCompletionTokens(350);
    setAvgTurnsPerResolved(4);
    setAvgTurnsBeforeEscalation(2);
  } else if (selectedModel.tier.includes('Tier 3')) {
    // Heavy reasoning, looking up database schemas, RAG data, and logic
    setAvgPromptTokens(1800);
    setAvgCompletionTokens(600);
    setAvgTurnsPerResolved(5);
    setAvgTurnsBeforeEscalation(3);
  }
}, [selectedModelName]); // Fires whenever the dropdown model changes


  const selectedModel = useMemo(() => {
    return LLM_MODELS.find(m => m.name === selectedModelName) || LLM_MODELS[1];
  }, [selectedModelName]);

  const metrics = useMemo(() => {
    const targetDeflections = Math.round(ticketVolume * (deflectionGoal / 100));
    const targetEscalations = ticketVolume - targetDeflections;

    const inputCostPerToken = selectedModel.inputCostPer1M / 1000000;
    const outputCostPerToken = selectedModel.outputCostPer1M / 1000000;
    const singleTurnCost = (avgPromptTokens * inputCostPerToken) + (avgCompletionTokens * outputCostPerToken);

    const costPerSuccessfulResolvedSession = singleTurnCost * avgTurnsPerResolved;
    const costPerEscalatedSession = singleTurnCost * avgTurnsBeforeEscalation;

    const successfulTokensCost = targetDeflections * costPerSuccessfulResolvedSession;
    const nonDeflectedSunkTokensCost = targetEscalations * costPerEscalatedSession;
    
    const monthlyTotalTokenSpent = successfulTokensCost + nonDeflectedSunkTokensCost;
     const totalMonthlyAICost = monthlyTotalTokenSpent + monthlyPlatformFee + monthlyAIOpsLabor;

    const pureHumanCost = ticketVolume * costPerLiveTicket;

    const hybridHumanCost = targetEscalations * costPerLiveTicket;
    const totalHybridCost = hybridHumanCost + totalMonthlyAICost;

    const monthlySavings = pureHumanCost - totalHybridCost;
    const annualSavings = monthlySavings * 12;
    
    const trueLoadedCostPerDeflection = targetDeflections > 0 
      ? totalMonthlyAICost / targetDeflections 
      : 0;

    const breakEvenMonths = monthlySavings > 0 
      ? Number((implementationCost / monthlySavings).toFixed(1)) 
      : Infinity;

    return {
      targetDeflections,
      targetEscalations,
      successfulTokensCost,
      nonDeflectedSunkTokensCost,
      monthlyTotalTokenSpent,
      totalMonthlyAICost,
      pureHumanCost,
      totalHybridCost,
      monthlySavings,
      annualSavings,
      trueLoadedCostPerDeflection,
      breakEvenMonths
    };
  }, [
    ticketVolume, costPerLiveTicket, deflectionGoal, selectedModel,
    avgPromptTokens, avgCompletionTokens, avgTurnsPerResolved, 
    avgTurnsBeforeEscalation, monthlyPlatformFee, implementationCost, monthlyAIOpsLabor 
  ]);

  const projectionTimelineData = useMemo(() => {
    let cumulativePureHuman = 0;
    let cumulativeHybrid = implementationCost;

    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      cumulativePureHuman += metrics.pureHumanCost;
      cumulativeHybrid += metrics.totalHybridCost;

      return {
        month: `Month ${monthNum}`,
        'Legacy Base Support ($)': Math.round(cumulativePureHuman),
        'AI Support Ops ($)': Math.round(cumulativeHybrid)
      };
    });
  }, [metrics, implementationCost]);

  const scattersData = useMemo(() => {
    return LLM_MODELS.map(m => {
      const inputCost = m.inputCostPer1M / 1000000;
      const outputCost = m.outputCostPer1M / 1000000;
      const turnCostAvg = (avgPromptTokens * inputCost) + (avgCompletionTokens * outputCost);
      const standardCostPerDeflectionSession = turnCostAvg * avgTurnsPerResolved;
      
      return {
        name: m.name,
        latency: m.averageLatencySeconds,
        costPerSession: Number((standardCostPerDeflectionSession * 100).toFixed(2)),
        tier: m.tier
      };
    });
  }, [avgPromptTokens, avgCompletionTokens, avgTurnsPerResolved]);

  return (
    <div className="w-full bg-white text-[#3a2a1a] p-6 md:p-10 rounded-xl border border-[#3a2a1a]/10 shadow-sm max-w-7xl mx-auto font-sans">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#3a2a1a]/10 pb-6 mb-8 gap-4">
        <div>
          <span className="px-3 py-1 bg-[#bc6a4c]/10 text-[#bc6a4c] text-xs font-bold rounded-full border border-[#bc6a4c]/20 tracking-wider uppercase">
            CFO-Defensible Financial Model
          </span>
          <h1 className="text-3xl font-bold tracking-tight mt-2 text-[#3a2a1a]">
            LLM Cost-to-Deflection Strategy Studio
          </h1>
          <p className="text-[#3a2a1a]/70 text-sm mt-1 max-w-2xl">
            A dynamic modeling suite translating ticket volumes, engineering latency ratios, and failure escapes into a clean corporate ledger.
          </p>
        </div>
        <div className="flex bg-[#f5f1eb] rounded-lg p-3 border border-[#3a2a1a]/10 text-xs max-w-sm text-[#3a2a1a]/85">
          <Info className="w-4.5 h-4.5 mr-2 text-[#b37a4c] shrink-0" />
          <p>
            Operating system strictly accounts for <strong className="text-[#3a2a1a]">Resolution-Weighted Accounting</strong>—calculating sunk execution tokens on handoffs.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
              {/* Left Column Input Control Form (Span 4) */}
        <div className="lg:col-span-4 bg-[#f5f1eb]/50 p-6 rounded-lg border border-[#3a2a1a]/10 space-y-6">
          <h2 className="text-lg font-bold text-[#3a2a1a] border-b border-[#3a2a1a]/10 pb-3 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#bc6a4c]" /> Operational Inputs
          </h2>

          <div className="space-y-4">
            {/* Ticket Volume Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#3a2a1a]/60">Monthly Ticket Volume</label>
                <span className="text-sm font-mono text-[#264653] font-bold">{ticketVolume.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="50000" 
                step="100" 
                value={ticketVolume} 
                onChange={(e) => setTicketVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-[#3a2a1a]/10 rounded-lg appearance-none cursor-pointer accent-[#264653]"
              />
            </div>

            {/* Cost Per Ticket Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#3a2a1a]/60 flex items-center gap-1">
                  Agent AHT Cost
                </label>
                <span className="text-sm font-mono text-[#264653] font-bold">${costPerLiveTicket.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="50" 
                step="0.5"
                value={costPerLiveTicket} 
                onChange={(e) => setCostPerLiveTicket(Number(e.target.value))}
                className="w-full h-1.5 bg-[#3a2a1a]/10 rounded-lg appearance-none cursor-pointer accent-[#264653]"
              />
            </div>

            {/* Target Deflection % */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#3a2a1a]/60">Target Deflection Goal %</label>
                <span className="text-sm font-mono text-[#bc6a4c] font-bold">{deflectionGoal}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="85" 
                step="1"
                value={deflectionGoal} 
                onChange={(e) => setDeflectionGoal(Number(e.target.value))}
                className="w-full h-1.5 bg-[#3a2a1a]/10 rounded-lg appearance-none cursor-pointer accent-[#bc6a4c]"
              />
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3a2a1a]/60 mb-2">Primary Gateway LLM</label>
              <select 
                value={selectedModelName} 
                onChange={(e) => setSelectedModelName(e.target.value)}
                className="w-full bg-white border border-[#3a2a1a]/20 rounded px-3 py-2 text-sm text-[#3a2a1a] focus:outline-none focus:ring-1 focus:ring-[#264653]"
              >
                {LLM_MODELS.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.provider} — {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* NEW: DYNAMIC PRESENTS WORKLOAD ARCHITECTURE EXPLANATION */}
            <div className="bg-white border border-[#3a2a1a]/10 p-4 rounded-lg text-xs space-y-2 mt-3 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-[#3a2a1a]/10">
                <span className="font-bold text-[#3a2a1a] uppercase text-[10px] tracking-wider font-mono">
                  Engine Classification
                </span>
                <span className={`px-2 py-0.5 text-[10px] uppercase font-black rounded ${
                  selectedModel.tier.includes('Tier 1') ? 'bg-[#264653]/10 text-[#264653]' :
                  selectedModel.tier.includes('Tier 2') ? 'bg-[#d4a017]/15 text-[#b37a4c]' :
                  'bg-[#bc6a4c]/10 text-[#bc6a4c]'
                }`}>
                  {selectedModel.tier}
                </span>
              </div>
              
              <div className="text-[#3a2a1a]/80 leading-relaxed text-[11px]">
                {selectedModel.tier.includes('Tier 1') && (
                  <p>
                    <strong>Ideal Workload Strategy:</strong> Simple Tier 1 queries. Routes structured FAQs, canned knowledge, and basic account lookups with fast responses and low costs.
                  </p>
                )}
                {selectedModel.tier.includes('Tier 2') && (
                  <p>
                    <strong>Ideal Workload Strategy:</strong> Intermediate diagnosis. Evaluates multi-layered scenarios requiring historical search, policy matching, or mild technical reasoning.
                  </p>
                )}
                {selectedModel.tier.includes('Tier 3') && (
                  <p>
                    <strong>Ideal Workload Strategy:</strong> Deep logic & complex RAG routing. Manages multi-step API toolcalls, strict validation rules, and heavy troubleshooting maps. Only use where reasoning is worth the premium pricing.
                  </p>
                )}
              </div>
              
              <div className="text-[10px] text-slate-500 italic pt-1 border-t border-[#3a2a1a]/5">
                ⏳ Presets dynamically matched to this tier class. Override below as needed.
              </div>
            </div>
          </div>

          {/* SIMULATION VARIABLES HEADER WITH CLARIFYING SUBHEADER */}
          <div className="border-b border-[#3a2a1a]/10 pb-3 pt-4">
            <h2 className="text-lg font-bold text-[#3a2a1a] flex items-center gap-2">
              <Info className="w-5 h-5 text-[#6a8c9c]" /> Simulation Parameters
            </h2>
            <p className="text-[10px] text-[#3a2a1a]/60 leading-tight mt-1">
              Fine-tune the complexity of your conversational runs to test margins.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#3a2a1a]/60 mb-1">Prompt Tokens / Turn</label>
                <input 
                  type="number" 
                  value={avgPromptTokens} 
                  onChange={(e) => setAvgPromptTokens(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-[#3a2a1a]/20 rounded px-2 py-1 text-[#3a2a1a] font-mono focus:border-[#264653] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#3a2a1a]/60 mb-1">Output Tokens / Turn</label>
                <input 
                  type="number" 
                  value={avgCompletionTokens} 
                  onChange={(e) => setAvgCompletionTokens(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-[#3a2a1a]/20 rounded px-2 py-1 text-[#3a2a1a] font-mono focus:border-[#264653] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#3a2a1a]/60 mb-1">Turns / Successful Case</label>
                <input 
                  type="number" 
                  value={avgTurnsPerResolved} 
                  onChange={(e) => setAvgTurnsPerResolved(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-[#3a2a1a]/20 rounded px-2 py-1 text-[#3a2a1a] font-mono focus:border-[#264653] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#3a2a1a]/60 mb-1">Turns / Escalated Case</label>
                <input 
                  type="number" 
                  value={avgTurnsBeforeEscalation} 
                  onChange={(e) => setAvgTurnsBeforeEscalation(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-[#3a2a1a]/20 rounded px-2 py-1 text-[#3a2a1a] font-mono focus:border-[#264653] focus:outline-none"
                />
              </div>
            </div>

                        {/* Flat platform Fees & AI Ops Labor */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#302010] mb-1">Platform SaaS / mo</label>
                  <input 
                    type="number" 
                    value={monthlyPlatformFee} 
                    onChange={(e) => setMonthlyPlatformFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-[#3a2a1a]/20 rounded px-2 py-1 text-[#264653] font-mono focus:border-[#264653] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#302010] mb-1">AI Ops Labor / mo</label>
                  <input 
                    type="number" 
                    value={monthlyAIOpsLabor} 
                    onChange={(e) => setMonthlyAIOpsLabor(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-[#3a2a1a]/20 rounded px-2 py-1 text-[#264653] font-mono focus:border-[#264653] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#302010] mb-1">Upfront Setup CapEx (One-Time)</label>
                <input 
                  type="number" 
                  value={implementationCost} 
                  onChange={(e) => setImplementationCost(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-[#3a2a1a]/20 rounded px-2 py-1 text-[#bc6a4c] font-mono focus:border-[#264653] focus:outline-none"
                />
              </div>
            </div>

          </div>
        </div>


        {/* Right Area Outputs Dash (Span 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            {/* Metric 1 */}
            <div className="bg-[#f5f1eb] border border-[#3a2a1a]/10 p-5 rounded-lg relative overflow-hidden">
              <div className="flex justify-between items-start text-[#3a2a1a]/70">
                <span className="text-[10px] uppercase tracking-wider font-bold">Annual Savings</span>
                <DollarSign className="w-4 h-4 text-[#264653]" />
              </div>
              <p className="text-2xl font-bold font-mono text-[#264653] mt-2">
                ${Math.round(metrics.annualSavings).toLocaleString()}
              </p>
              <div className="absolute bottom-0 right-0 left-0 h-1 bg-[#264653]" />
            </div>

            {/* Metric 2 */}
            <div className="bg-[#f5f1eb] border border-[#3a2a1a]/10 p-5 rounded-lg relative overflow-hidden">
              <div className="flex justify-between items-start text-[#3a2a1a]/70">
                <span className="text-[10px] uppercase tracking-wider font-bold">Cost/Deflection</span>
                <TrendingUp className="w-4 h-4 text-[#bc6a4c]" />
              </div>
              <p className="text-2xl font-bold font-mono text-[#bc6a4c] mt-2">
                ${metrics.trueLoadedCostPerDeflection.toFixed(2)}
              </p>
              <p className="text-[9px] text-[#3a2a1a]/50 mt-1">vs ${costPerLiveTicket.toFixed(0)} human core</p>
              <div className="absolute bottom-0 right-0 left-0 h-1 bg-[#bc6a4c]" />
            </div>

            {/* Metric 3 */}
            <div className="bg-[#f5f1eb] border border-[#3a2a1a]/10 p-5 rounded-lg relative overflow-hidden">
              <div className="flex justify-between items-start text-[#3a2a1a]/70">
                <span className="text-[10px] uppercase tracking-wider font-bold">CapEx Payback</span>
                <Zap className="w-4 h-4 text-[#d4a017]" />
              </div>
              <p className="text-2xl font-bold font-mono text-[#d4a017] mt-2">
                {metrics.breakEvenMonths === Infinity ? 'N/A' : `${metrics.breakEvenMonths} mo`}
              </p>
              <p className="text-[9px] text-[#3a2a1a]/50 mt-1">To recover setup costs</p>
              <div className="absolute bottom-0 right-0 left-0 h-1 bg-[#d4a017]" />
            </div>

            {/* Metric 4 */}
            <div className="bg-[#f5f1eb] border border-[#3a2a1a]/10 p-5 rounded-lg relative overflow-hidden">
              <div className="flex justify-between items-start text-[#3a2a1a]/70">
                <span className="text-[10px] uppercase tracking-wider font-bold">Escaped Sunk Cost</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-rose-700 mt-2">
                ${Math.round(metrics.nonDeflectedSunkTokensCost).toLocaleString()}
              </p>
              <p className="text-[9px] text-[#3a2a1a]/50 mt-1">Escalated interface token cost</p>
              <div className="absolute bottom-0 right-0 left-0 h-1 bg-red-500" />
            </div>

          </div>

          {/* Tabular/Section: TCO Projections Area Chart */}
          <div className="bg-[#f5f1eb]/35 p-5 rounded-lg border border-[#3a2a1a]/10">
            <h3 className="text-xs font-bold uppercase text-[#3a2a1a] tracking-wider mb-4 flex items-center justify-between">
              <span>Cumulative 12-Month Base Support Cost vs AI Ops</span>
              <span className="text-[10px] font-normal normal-case text-[#3a2a1a]/60">
                CapEx amortizes quickly against human workload margins
              </span>
            </h3>
            
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionTimelineData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHuman" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#bc6a4c" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#bc6a4c" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#264653" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#264653" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a2a1a/5" />
                  <XAxis dataKey="month" stroke="#3a2a1a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#3a2a1a" fontSize={10} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#3a2a1a/10', borderRadius: '4px' }}
                    labelStyle={{ color: '#3a2a1a', fontWeight: 'bold' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="Legacy Base Support ($)" stroke="#bc6a4c" fillOpacity={1} fill="url(#colorHuman)" strokeWidth={2} />
                  <Area type="monotone" dataKey="AI Support Ops ($)" stroke="#264653" fillOpacity={1} fill="url(#colorAI)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Split Charts Block (Deflection Cost Breakdown & Model Comparison Matrix) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Deflection Spend Allocation */}
            <div className="bg-[#f5f1eb]/35 p-5 rounded-lg border border-[#3a2a1a]/10 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase text-[#3a2a1a] tracking-wider mb-1 flex items-center justify-between">
                  <span>Target API Allocation Strategy</span>
                </h3>
                <p className="text-[11px] text-[#3a2a1a]/70 mb-4">
                  Contrasts token payouts allocated to resolved runs vs. system work lost on handoffs.
                </p>
              </div>
              
              <div className="h-44 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'API Budgeting',
                        'Resolved Conversions': Math.round(metrics.successfulTokensCost),
                        'Escalated Waste': Math.round(metrics.nonDeflectedSunkTokensCost)
                      }
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a2a1a/10" horizontal={false} />
                    <XAxis type="number" stroke="#3a2a1a" fontSize={9} tickFormatter={(val) => `$${val}`} />
                    <YAxis type="category" dataKey="name" stroke="#3a2a1a" fontSize={9} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#3a2a1a/10' }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="Resolved Conversions" stackId="a" fill="#6a8c9c" barSize={32} />
                    <Bar dataKey="Escalated Waste" stackId="a" fill="#bc6a4c" barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-[#3a2a1a]/80 leading-normal mt-4 bg-white p-3 rounded border border-[#3a2a1a]/10">
                ⚠️ <strong className="text-[#3a2a1a]">Escalated Hand-off Ratio:</strong>{' '}
                <span className="font-bold font-mono">
                  {((metrics.nonDeflectedSunkTokensCost / (metrics.monthlyTotalTokenSpent || 1)) * 100).toFixed(1)}%
                </span>{' '}
                of token spend is lost on human handoffs. Improving agent routing limits this system leakage.
              </p>
            </div>

            {/* Model Comparison Matrix */}
            <div className="bg-[#f5f1eb]/35 p-5 rounded-lg border border-[#3a2a1a]/10">
              <h3 className="text-xs font-bold uppercase text-[#3a2a1a] tracking-wider mb-1 flex items-center justify-between">
                <span>Latency vs. Cost Matrix</span>
              </h3>
              <p className="text-[11px] text-[#3a2a1a]/70 mb-4">
                Compares average model agent delay (seconds) against loaded transaction token cost (in ¢).
              </p>

              <div className="h-44 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a2a1a/10" />
                    <XAxis 
                      type="number" 
                      dataKey="latency" 
                      name="Latency" 
                      unit="s" 
                      stroke="#3a2a1a" 
                      fontSize={9}
                      label={{ value: 'Response Latency', position: 'insideBottom', offset: -10, fill: '#3a2a1a', fontSize: 9 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="costPerSession" 
                      name="Cost/Deflection" 
                      unit="¢" 
                      stroke="#3a2a1a" 
                      fontSize={9}
                      label={{ value: 'Cost/Session (¢)', angle: -90, position: 'insideLeft', offset: -5, fill: '#3a2a1a', fontSize: 9 }}
                    />
                    <ZAxis type="category" dataKey="name" name="Model" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#3a2a1a/10' }}
                    />
                    <Scatter name="Models" data={scattersData} fill="#264653">
                      <LabelList dataKey="name" position="top" style={{ fill: '#3a2a1a', fontSize: 8, fontWeight: 500 }} />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-[#3a2a1a]/80 leading-normal mt-4 bg-white p-2 text-center rounded border border-[#3a2a1a]/10">
                💡 <span className="text-[#264653] font-semibold">Routing Advice:</span> Handle Tier 1 diagnostics on <strong className="text-[#bc6a4c]">GPT-4o Mini / Flash</strong>. Reserve complex logic for advanced layers.
              </p>
            </div>

          </div>

          {/* Citations Assumptions */}
          <div className="bg-[#f5f1eb]/50 border border-[#3a2a1a]/10 p-5 rounded-lg text-xs space-y-3">
            <h4 className="font-bold text-[#3a2a1a] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#264653]" /> Executive Cost Proving Methodology
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[#3a2a1a]/80 leading-relaxed text-[11px]">
              <div>
                <p className="mb-2">
                  <strong className="text-[#3a2a1a]">1. Defended Human Standard</strong><br />
                  Staff operations cost modeling parameters utilize Zendesk and CX Network benchmarks representing fully-loaded human handling overhead ($15-$25/ticket).
                </p>
                <p>
                  <strong className="text-[#3a2a1a]">2. Sunk Escalation Tax Rate</strong><br />
                  Failed loops represent a critical system expense. Standard models hide this; our framework computes handoff interface leaks explicitly.
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <strong className="text-[#3a2a1a]">3. Thread Loop Scaling</strong><br />
                  Token thresholds support typical state limits including system logic payloads, historic prompt strings, memory pools, and retrieval indexing.
                </p>
                <p>
                  <strong className="text-[#3a2a1a]">4. Current API Indexing</strong><br />
                  Model cost indexes utilize current active token structures standard across providers.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
