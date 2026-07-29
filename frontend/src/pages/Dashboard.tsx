import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award, CheckCircle2, Code2, Cpu, Flame, ArrowRight, TrendingUp,
  Brain, ShieldCheck, Zap, Clock, Sparkles, BookOpen, Users,
  BarChart2, GitBranch, Loader2, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProblems, getSubmissions, Problem, Submission } from '../services/api';
import OnboardingModal from '../components/OnboardingModal';
import StreakBadge from '../components/StreakBadge';
import BadgeCelebrationModal from '../components/BadgeCelebrationModal';
import api from '../services/api';

interface UserStats {
  currentStreak: number;
  longestStreak: number;
  successfulSubmissions: number;
  totalSubmissions: number;
  badgesEarned: number;
  velocityScore: number;
  unlockedTier: string;
  onboardingComplete: boolean;
  geoCity?: string;
  geoCountry?: string;
  githubUsername?: string;
  avatarUrl?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Onboarding + celebration state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);
  const [celebrationBadge, setCelebrationBadge] = useState<{ title: string; score: number } | null>(null);

  // Recruiter popup state (shows after 10 submissions)
  const [showRecruiterAlert, setShowRecruiterAlert] = useState(false);

  // Extra user stats fetched from /api/auth/me (extended fields)
  const [stats, setStats] = useState<Partial<UserStats>>({});

  const userTier = user?.tier || 'Explorer';
  const userXp = user?.xp || 150;
  const nextTierXp = userTier === 'Explorer' ? 500 : userTier === 'Apprentice' ? 1200 : 2500;
  const xpProgress = Math.min(100, Math.round((userXp / nextTierXp) * 100));

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [problemsData, submissionsData, meRes] = await Promise.all([
          getProblems(),
          getSubmissions().catch(() => ({ data: [] })),
          api.get('/auth/me').catch(() => ({ data: { user: {} } })),
        ]);
        setProblems(problemsData);
        setSubmissions(submissionsData.data || []);

        const meUser = meRes.data?.user || {};
        setStats({
          currentStreak: meUser.currentStreak || 0,
          longestStreak: meUser.longestStreak || 0,
          successfulSubmissions: meUser.successfulSubmissions || 0,
          totalSubmissions: meUser.totalSubmissions || 0,
          badgesEarned: meUser.badgesEarned || 0,
          velocityScore: meUser.velocityScore || 0,
          unlockedTier: meUser.unlockedTier || 'free',
          onboardingComplete: meUser.onboardingComplete ?? true,
          geoCity: meUser.geoCity,
          geoCountry: meUser.geoCountry,
          githubUsername: meUser.githubUsername,
          avatarUrl: meUser.avatarUrl,
        });

        // Show onboarding if not complete
        if (meUser.onboardingComplete === false) {
          setShowOnboarding(true);
        }

        // Show recruiter alert if first time hitting 10 sims
        const totalSubs = (submissionsData.data || []).length;
        const alerted = localStorage.getItem('tf_recruiter_alerted');
        if (totalSubs >= 10 && !alerted) {
          setTimeout(() => setShowRecruiterAlert(true), 800);
          localStorage.setItem('tf_recruiter_alerted', '1');
        }

        // Check for new badge earned (badgesEarned > last known)
        const lastBadges = parseInt(localStorage.getItem('tf_last_badges') || '0');
        if ((meUser.badgesEarned || 0) > lastBadges && lastBadges > 0) {
          setCelebrationBadge({ title: 'Verified Skill Badge', score: 85 });
          setShowBadgeCelebration(true);
        }
        localStorage.setItem('tf_last_badges', String(meUser.badgesEarned || 0));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const completedCount = submissions.filter(s => s.status === 'completed').length;
  const velocity = stats.velocityScore || Math.max(1, Math.round((stats.totalSubmissions || 0) / 4));

  return (
    <div className="space-y-8 pb-12">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          userName={user?.name?.split(' ')[0] || 'Candidate'}
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {/* Badge Celebration Modal */}
      {showBadgeCelebration && celebrationBadge && (
        <BadgeCelebrationModal
          badgeTitle={celebrationBadge.title}
          score={celebrationBadge.score}
          onClose={() => setShowBadgeCelebration(false)}
        />
      )}

      {/* Recruiter Popup Alert */}
      {showRecruiterAlert && (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950 p-5 shadow-2xl shadow-emerald-500/20 animate-in slide-in-from-bottom-4">
          <button onClick={() => setShowRecruiterAlert(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white transition">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-white">🎉 Recruiters Can See You!</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                You've completed 10 simulations. Your profile is now visible to employers in the Discover portal.
              </p>
              <Link to="/profile" className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition">
                View your profile <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl transition-colors duration-200">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3 py-1 text-xs font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/40">
                <Sparkles className="h-3.5 w-3.5" /> TalentForge • Active Session
              </div>
              {/* Streak Badge */}
              <StreakBadge streak={stats.currentStreak || 0} size="sm" />
              {/* Geo */}
              {stats.geoCity && (
                <span className="text-[11px] font-semibold text-slate-400">📍 {stats.geoCity}{stats.geoCountry ? `, ${stats.geoCountry}` : ''}</span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              {stats.onboardingComplete === false
                ? '👋 Let\'s finish setting up your profile to unlock the full platform experience.'
                : `Completed ${completedCount} challenges • ${stats.currentStreak || 0}-day streak • ${stats.unlockedTier === 'free' ? 'Free tier' : `${stats.unlockedTier} tier unlocked`}`}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {stats.onboardingComplete === false && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
              >
                <Sparkles className="h-4 w-4" /> Complete Setup
              </button>
            )}
            <Link
              to="/problems"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-all"
            >
              Solve Next Challenge <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* XP + Tier Bar */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Current Tier</span>
              <span className="font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{userTier}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500" style={{ width: `${xpProgress}%` }} />
            </div>
            <p className="text-[10px] text-slate-400">{userXp} / {nextTierXp} XP ({xpProgress}% to next tier)</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Verified Domain</span>
              <span className="font-bold text-slate-900 dark:text-white uppercase">{user?.domain || 'CSE'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Cpu className="h-4 w-4 text-purple-500" /> Algorithms & Systems Engineering
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Verification Rank</span>
              <span className="font-bold text-emerald-500">Top 5% Student Proof</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Polygon Amoy Testnet Ready
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid (8 cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Solved */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Solved</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500"><CheckCircle2 className="h-4 w-4" /></div>
          </div>
          <div className="mt-3"><span className="text-2xl font-extrabold text-slate-900 dark:text-white">{completedCount}</span><span className="text-xs text-slate-400 ml-1.5">/ {problems.length}</span></div>
          <div className="mt-1.5 text-[11px] font-medium text-emerald-500 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Autograded correctness</div>
        </div>

        {/* Streak */}
        <div className="rounded-2xl border border-orange-200/60 dark:border-orange-900/30 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Streak</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500"><Flame className="h-4 w-4" /></div>
          </div>
          <div className="mt-3"><span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.currentStreak || 0}</span><span className="text-xs text-slate-400 ml-1.5">day streak</span></div>
          <div className="mt-1.5 text-[11px] font-medium text-orange-500 flex items-center gap-1"><Flame className="h-3 w-3" /> Best: {stats.longestStreak || 0} days</div>
        </div>

        {/* Badges */}
        <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/30 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">NFT Badges</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500"><Award className="h-4 w-4" /></div>
          </div>
          <div className="mt-3"><span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.badgesEarned || 0}</span><span className="text-xs text-slate-400 ml-1.5">ERC-721</span></div>
          <div className="mt-1.5 text-[11px] font-medium text-amber-500 flex items-center gap-1"><Sparkles className="h-3 w-3" /> 5 subs = 1 badge</div>
        </div>

        {/* Velocity */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Velocity</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500"><BarChart2 className="h-4 w-4" /></div>
          </div>
          <div className="mt-3"><span className="text-2xl font-extrabold text-slate-900 dark:text-white">{velocity}</span><span className="text-xs text-slate-400 ml-1.5">subs/week</span></div>
          <div className="mt-1.5 text-[11px] font-medium text-purple-500 flex items-center gap-1"><Zap className="h-3 w-3" /> {stats.totalSubmissions || 0} total attempts</div>
        </div>
      </div>

      {/* Recruiter Visibility Banner */}
      {(stats.totalSubmissions || 0) >= 10 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 p-5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">🎯 Your profile is visible to recruiters!</p>
              <p className="text-[11px] text-slate-400">Employers can now discover you in the TalentForge talent pool.</p>
            </div>
          </div>
          <Link to="/profile" className="shrink-0 rounded-xl border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition">
            View Profile →
          </Link>
        </div>
      )}

      {/* Badge Unlock Progress */}
      {(stats.successfulSubmissions || 0) < 5 && (
        <div className="rounded-2xl border border-amber-500/20 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" /> First NFT Badge Progress
            </h3>
            <span className="text-xs font-extrabold text-amber-500">{stats.successfulSubmissions || 0}/5 successful submissions</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              style={{ width: `${((stats.successfulSubmissions || 0) / 5) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">{Math.max(0, 5 - (stats.successfulSubmissions || 0))} more successful submissions to earn your first ERC-721 badge</p>
        </div>
      )}

      {/* Main 2-col: Recommended Problems + Recent Submissions */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recommended Challenges */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="h-4 w-4 text-brand-500" /> Recommended Challenges
            </h2>
            <Link to="/problems" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">View All →</Link>
          </div>

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {problems.slice(0, 4).map((problem) => (
                <div key={problem.id} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-brand-500/50 hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-400 border border-brand-200/40 dark:border-brand-800/40">{problem.tier}</span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{problem.domain}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{problem.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-bold text-amber-500">+{problem.reward} XP</span>
                    <Link
                      to={`/problems/${problem.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-600 transition-all shadow-sm"
                    >
                      Solve <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Learning CTA */}
          <Link
            to="/learning"
            className="flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500/20 transition">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Learning Center</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Curated video lessons for every problem type and difficulty tier</p>
            </div>
            <ArrowRight className="h-4 w-4 text-indigo-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Recent Submissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" /> Recent Submissions
            </h2>
            <Link to="/submissions" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">All →</Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            {loading ? (
              <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
            ) : submissions.length === 0 ? (
              <div className="py-6 text-center space-y-3">
                <Code2 className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs text-slate-400">No submissions yet. Start a challenge!</p>
              </div>
            ) : (
              submissions.slice(0, 5).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sub.problem?.title || 'Challenge'}</h4>
                    <span className="text-[10px] text-slate-400">{new Date(sub.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-500">{sub.score || 100}%</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      sub.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      sub.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>{sub.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* GitHub Widget */}
          {stats.githubUsername && (
            <a
              href={`https://github.com/${stats.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm"
            >
              <GitBranch className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">@{stats.githubUsername}</p>
                <p className="text-[10px] text-slate-400">GitHub profile linked</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 ml-auto" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
