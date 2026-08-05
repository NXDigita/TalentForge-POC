import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Zap,
  Brain,
  Code2,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  Star,
  Bot,
  Compass,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white pb-20">
      {/* Top Floating Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 text-center max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-extrabold text-purple-300 backdrop-blur-md shadow-lg shadow-purple-500/10">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span>TalentForge v1 • AI Psychometric & Algorithmic Proof Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Verify Engineering Mastery with <br />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            AI Psychometrics & Code Proof
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          The performance verification engine replacing resume inflation. Earn cryptographic, AI-verified skill badges and connect directly with top tech employers.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/assessment"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-purple-500/25 hover:bg-purple-500 transition-all hover:scale-105 active:scale-95"
          >
            <Brain className="h-5 w-5" /> Take 15-Min Assessment
          </Link>

          <Link
            to="/discover"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-8 py-4 text-sm font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-md"
          >
            <Users className="h-5 w-5 text-indigo-400" /> Employer Recruiter Portal
          </Link>
        </div>

        {/* Live Tech Metrics Stats Bar */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assessment Timer</span>
            <span className="text-2xl font-black text-purple-400 font-mono">15:00 Mins</span>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Verification Speed</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">&lt; 1.2s</span>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Flagship Problem</span>
            <span className="text-base font-black text-white truncate block">Load Balancer</span>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AI Provider</span>
            <span className="text-base font-black text-purple-300 truncate block">Ollama / Claude</span>
          </div>
        </div>
      </section>

      {/* 3-Step How-It-Works Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How TalentForge Verifies Engineers in 3 Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            From cognitive diagnostic finger-printing to real-time code evaluation and expert human reviews.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 space-y-4 hover:border-purple-500/40 transition">
            <div className="h-12 w-12 rounded-2xl bg-purple-600/20 text-purple-400 font-black flex items-center justify-center text-lg border border-purple-500/30">
              01
            </div>
            <h3 className="text-lg font-bold text-white">15-Min Psychometric Assessment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete a 15-minute diagnostic covering 5 core dimensions: Logical Reasoning, Attention to Detail, Persistence, Learning Speed, and Architecture.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 space-y-4 hover:border-indigo-500/40 transition">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 text-indigo-400 font-black flex items-center justify-center text-lg border border-indigo-500/30">
              02
            </div>
            <h3 className="text-lg font-bold text-white">AI Psychometrics & Code Execution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solve engineering challenges in Monaco Editor with an AI Copilot. Take the psychological assessment to build your 5-trait radar map.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 space-y-4 hover:border-emerald-500/40 transition">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600/20 text-emerald-400 font-black flex items-center justify-center text-lg border border-emerald-500/30">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Dynamic 4-Part Aggregate Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get assessed fairly. Your total score is a blend of your Code Submissions, Psychometric Profile, Platform Profile, and an automated GitHub integration!
            </p>
          </div>
        </div>
      </section>

      {/* Badge Showcase Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Verified Badge Registry Showcase</h2>
            <p className="text-xs text-slate-400">Cryptographically verifiable credentials backed by real execution output.</p>
          </div>

          <Link to="/profile" className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1">
            Explore Badge Gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Badge Card 1 */}
          <div className="rounded-3xl border border-purple-500/30 bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-[10px] font-extrabold text-purple-300 border border-purple-500/40">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" /> Expert Verified
              </span>
              <span className="font-mono text-emerald-400 font-black text-sm">98 / 100</span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">Build a Load Balancer</h3>
              <p className="text-xs text-slate-400">Flagship Architectural Challenge</p>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800 flex justify-between">
              <span>Verified: Senior Architect</span>
              <span>10/10 Test Cases Passed</span>
            </div>
          </div>

          {/* Badge Card 2 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                <Bot className="h-3.5 w-3.5 text-emerald-400" /> AI Verified
              </span>
              <span className="font-mono text-emerald-400 font-black text-sm">95 / 100</span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">LRU Cache System</h3>
              <p className="text-xs text-slate-400">Data Structures & O(1) Eviction</p>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800 flex justify-between">
              <span>Verified: AI Engine</span>
              <span>8/8 Test Cases Passed</span>
            </div>
          </div>

          {/* Badge Card 3 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                <Bot className="h-3.5 w-3.5 text-emerald-400" /> AI Verified
              </span>
              <span className="font-mono text-emerald-400 font-black text-sm">92 / 100</span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">Token Bucket Rate Limiter</h3>
              <p className="text-xs text-slate-400">Distributed Systems & Refill Queues</p>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800 flex justify-between">
              <span>Verified: AI Engine</span>
              <span>8/8 Test Cases Passed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Employer Recruiter Callout CTA */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-purple-500/40 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Recruiting Top 1% Engineering Talent?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Filter candidates by verified performance scores, inspect psychometric radar charts, and view read-only Monaco code samples.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-xs font-black text-slate-950 hover:bg-slate-100 transition shadow-lg"
            >
              <Users className="h-4 w-4 text-purple-600" /> Open Employer Recruiter Discover
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-8 py-3.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Create Employer Recruiter Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
