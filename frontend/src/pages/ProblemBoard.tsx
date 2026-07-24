import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, Filter, Code2, Award, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';
import { getProblems, Problem } from '../services/api';

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Explorer: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'from-emerald-500/20 to-teal-500/10',
  },
  Apprentice: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    glow: 'from-blue-500/20 to-cyan-500/10',
  },
  Builder: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    glow: 'from-indigo-500/20 to-purple-500/10',
  },
  Master: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    glow: 'from-amber-500/20 to-orange-500/10',
  },
};

export default function ProblemBoard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  useEffect(() => {
    async function fetchProblems() {
      try {
        setLoading(true);
        const data = await getProblems();
        setProblems(data);
      } catch (err: any) {
        console.error('Failed to load problems:', err);
        setError('Unable to connect to problem database.');
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, []);

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDomain =
      selectedDomain === 'all' || problem.domain.toLowerCase() === selectedDomain.toLowerCase();

    const matchesTier =
      selectedTier === 'all' || problem.tier.toLowerCase() === selectedTier.toLowerCase();

    return matchesSearch && matchesDomain && matchesTier;
  });

  const tiers = ['all', 'Explorer', 'Apprentice', 'Builder', 'Master'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute right-32 -bottom-12 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/10 text-brand-300">
            <Sparkles className="h-3.5 w-3.5" /> Verified Execution Sandbox
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Problem Board
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Choose a challenge tailored to your skill tier. Solutions are autograded in isolated container sandboxes to calculate your verified skill proof score.
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by title, topic, or keyword..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Domain Dropdown Filter */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1 border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedDomain === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Domains
            </button>
            <button
              onClick={() => setSelectedDomain('cse')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedDomain === 'cse'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              CSE
            </button>
            <button
              onClick={() => setSelectedDomain('ece')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedDomain === 'ece'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ECE
            </button>
          </div>

          {/* Tier Difficulty Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <Filter className="h-4 w-4 text-slate-400 mr-1 hidden sm:block" />
            {tiers.map((tier) => {
              const active = selectedTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all border ${
                    active
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {tier === 'all' ? 'All Tiers' : tier}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 animate-pulse space-y-4"
            >
              <div className="flex justify-between">
                <div className="h-6 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-6 w-16 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-6 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-16 w-full rounded-lg bg-slate-100 dark:bg-slate-800/50" />
              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-6 text-center text-red-600 dark:text-red-400">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty Filter Results */}
      {!loading && !error && filteredProblems.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No challenges match your filter</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search query, domain, or tier filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDomain('all');
              setSelectedTier('all');
            }}
            className="mt-4 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Problem Cards Grid */}
      {!loading && !error && filteredProblems.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProblems.map((problem) => {
            const tierStyle = TIER_COLORS[problem.tier] || TIER_COLORS['Explorer'];

            return (
              <div
                key={problem.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl hover:border-brand-500/50 transition-all duration-300"
              >
                {/* Decorative Hover Glow */}
                <div
                  className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${tierStyle.glow} opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-300`}
                />

                <div className="space-y-4 relative z-10">
                  {/* Top Meta Badges */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      <Code2 className="h-3 w-3 text-slate-400" />
                      {problem.domain}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                    >
                      {problem.tier}
                    </span>
                  </div>

                  {/* Problem Title & Preview */}
                  <div>
                    <Link to={`/problems/${problem.slug}`}>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {problem.title}
                      </h3>
                    </Link>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {problem.description.replace(/^##\s+.*$/gm, '').replace(/```[\s\S]*?```/g, '').trim()}
                    </p>
                  </div>
                </div>

                {/* Footer Stats & Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    {/* Reward XP */}
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Award className="h-3.5 w-3.5" />
                      +{problem.reward} XP
                    </div>

                    {/* Test Cases Count */}
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <CheckCircle2 className="h-3 w-3" />
                      {problem.publicTestCases?.length || 0} Testcases
                    </div>
                  </div>

                  {/* Solve Button */}
                  <Link
                    to={`/problems/${problem.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-3.5 py-1.5 text-xs font-bold text-white dark:text-slate-950 group-hover:bg-brand-600 dark:group-hover:bg-brand-500 dark:group-hover:text-white transition-all shadow-sm"
                  >
                    Solve <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
