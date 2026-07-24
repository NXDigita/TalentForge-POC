import { useState } from 'react';
import {
  User,
  Mail,
  Award,
  ShieldCheck,
  Brain,
  Cpu,
  Save,
  CheckCircle2,
  ExternalLink,
  Flame,
  Sparkles,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || 'Karthikeyan');
  const [domain, setDomain] = useState(user?.domain || 'cse');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Profile settings updated successfully!');
    }, 600);
  };

  const userTier = user?.tier || 'Explorer';
  const userXp = user?.xp || 150;
  const nextTierXp = userTier === 'Explorer' ? 500 : userTier === 'Apprentice' ? 1200 : 2500;
  const xpProgress = Math.min(100, Math.round((userXp / nextTierXp) * 100));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      {/* Profile Header Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute right-40 -bottom-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Ring */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-2xl font-extrabold text-white shadow-xl shadow-brand-500/20 border-2 border-white/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {user?.name || 'Student Candidate'}
                </h1>
                <span className="rounded-md bg-brand-50 dark:bg-brand-950/50 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/40">
                  {userTier}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {user?.email || 'student@college.edu'}
                </span>
                <span>•</span>
                <span className="uppercase font-semibold text-brand-500">
                  {user?.domain || 'cse'} Engineering
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-500 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" /> Verified Candidate Profile
          </div>
        </div>

        {/* XP Tier Progress Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-500" /> Tier XP Progress
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {userXp} / {nextTierXp} XP ({xpProgress}%)
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Competency Index & Blockchain Badges */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Psychometric Competency Profile */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" /> Psychometric Competency Profile
            </h2>
            <span className="text-xs font-semibold text-purple-400">88/100 Index</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Logical Reasoning & Problem Decomposition</span>
                <span className="font-bold text-emerald-500">92 / 100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 w-[92%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Code Precision & Syntax Accuracy</span>
                <span className="font-bold text-blue-500">88 / 100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 w-[88%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>System Architecture & Edge Case Resilience</span>
                <span className="font-bold text-purple-500">95 / 100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 w-[95%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Big-O Execution Efficiency</span>
                <span className="font-bold text-amber-500">85 / 100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 w-[85%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Verified Blockchain Proofs (ERC-721 Badges) */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> On-Chain Skill Proof (ERC-721)
            </h2>
            <span className="text-xs font-semibold text-amber-500">Polygon Amoy Testnet</span>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/10 p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">TalentForge Explorer NFT #0042</h3>
                  <p className="text-[11px] text-slate-400">Minted on Polygon Testnet</p>
                </div>
              </div>

              <a
                href="https://amoy.polygonscan.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition"
              >
                PolygonScan <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-3 font-mono text-[11px] text-slate-400 border border-slate-800 flex items-center justify-between">
              <span className="truncate max-w-xs">Tx: 0x7f9a8b2c4d5e6f1a0b3c2d4e5f6a7b8c9d0e1f2a</span>
              <span className="text-emerald-400 font-bold">Confirmed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Profile Settings Form */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5 text-brand-500" /> Account Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Update your candidate profile information and engineering domain preferences.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Candidate Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Email (Disabled) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || 'student@college.edu'}
                  disabled
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Engineering Domain */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Engineering Specialization
              </label>
              <div className="relative">
                <Cpu className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="cse">CSE - Computer Science & Engineering</option>
                  <option value="ece">ECE - Electronics & Communication</option>
                </select>
              </div>
            </div>

            {/* Change Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Update Password (Optional)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition shadow-lg shadow-brand-500/20 disabled:opacity-75"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
