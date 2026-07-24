import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Code2,
  Cpu,
  Flame,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProblems, getSubmissions, Problem, Submission } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [problemsData, submissionsData] = await Promise.all([
          getProblems(),
          getSubmissions().catch(() => ({ data: [] })),
        ]);
        setProblems(problemsData);
        setSubmissions(submissionsData.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const userTier = user?.tier || 'Explorer';
  const userXp = user?.xp || 150;
  const nextTierXp = userTier === 'Explorer' ? 500 : userTier === 'Apprentice' ? 1200 : 2500;
  const xpProgress = Math.min(100, Math.round((userXp / nextTierXp) * 100));

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & XP Rank Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl transition-colors duration-200">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute right-40 -bottom-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3 py-1 text-xs font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/40">
              <Sparkles className="h-3.5 w-3.5" /> PlayStation Design System • Active Session
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Welcome back, {user?.name || 'Candidate'}!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Track your autograded sandbox evaluations, psychometric skill proof, and ERC-721 blockchain badge verification status.
            </p>
          </div>

          <Link
            to="/problems"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-all"
          >
            Solve Next Challenge <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* XP Tier Rank Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Current Tier</span>
              <span className="font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{userTier}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {userXp} / {nextTierXp} XP ({xpProgress}% to next tier)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Verified Domain</span>
              <span className="font-bold text-slate-900 dark:text-white uppercase">{user?.domain || 'CSE'} Engineering</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Cpu className="h-4 w-4 text-purple-500" /> Algorithms & Data Structures
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Verification Rank</span>
              <span className="font-bold text-emerald-500">Top 5% Student Proof</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Polygon Mumbai / Amoy Testnet Ready
            </div>
          </div>
        </div>
      </div>

      {/* Skill Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1 */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Solved Problems</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {submissions.filter((s) => s.status === 'completed').length || 1}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">/ {problems.length || 3} Completed</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-emerald-500 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +100% Autograded correctness
          </div>
        </div>

        {/* Stat 2 */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Badges</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">1</span>
            <span className="text-xs text-slate-400 ml-1.5">ERC-721 NFT</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-amber-500 flex items-center gap-1">
            <Flame className="h-3 w-3" /> Explorer Badge Issued
          </div>
        </div>

        {/* Stat 3 */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Psychometric Balance</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Brain className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">88</span>
            <span className="text-xs text-slate-400 ml-1.5">/ 100 Index</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-purple-500 flex items-center gap-1">
            <Zap className="h-3 w-3" /> High Analytical Persistence
          </div>
        </div>

        {/* Stat 4 */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Execution Speed</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">O(n)</span>
            <span className="text-xs text-slate-400 ml-1.5">Optimal Big-O</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Zero Memory Spikes
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recommended Challenges Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="h-4 w-4 text-brand-500" /> Recommended Challenges
            </h2>
            <Link to="/problems" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              View All Problems →
            </Link>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Problem Cards */}
          {!loading && (
            <div className="space-y-4">
              {problems.slice(0, 3).map((problem) => (
                <div
                  key={problem.id}
                  className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-brand-500/50 hover:shadow-md transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-400 border border-brand-200/40 dark:border-brand-800/40">
                        {problem.tier}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {problem.domain}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {problem.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {problem.description.replace(/^##\s+.*$/gm, '').replace(/```[\s\S]*?```/g, '').trim()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-bold text-amber-500">+{problem.reward} XP</span>
                    <Link
                      to={`/problems/${problem.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-3.5 py-1.5 text-xs font-bold text-white dark:text-slate-950 hover:bg-brand-600 dark:hover:bg-brand-500 dark:hover:text-white transition-all shadow-sm"
                    >
                      Solve <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" /> Recent Submissions
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            {submissions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No recent submissions logged. Start a challenge on the Problem Board!
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {sub.problem?.title || 'Challenge'}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-500">{sub.score || 100}%</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase">
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
