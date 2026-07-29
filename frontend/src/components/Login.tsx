import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, Github, Linkedin, Eye, EyeOff, Sparkles } from 'lucide-react';
import api from '../services/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const ROLE_HOME: Record<string, string> = {
  employer: '/discover',
  recruiter: '/discover',
  company: '/discover',
  reviewer: '/reviewer',
  admin: '/admin',
};

function getRoleHome(email: string): string {
  const lower = email.toLowerCase();
  for (const [key, path] of Object.entries(ROLE_HOME)) {
    if (lower.includes(key)) return path;
  }
  return '/dashboard';
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setApiError(null);
      setIsSubmitting(true);
      await login(data.email, data.password);
      navigate(getRoleHome(data.email), { replace: true });
    } catch (err: any) {
      setApiError(err.response?.data?.error || 'Invalid credentials or connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGitHubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId || clientId === 'your_github_client_id') {
      setApiError('GitHub OAuth is not configured. Use email/password login or add VITE_GITHUB_CLIENT_ID to your .env');
      return;
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth-callback?provider=github`);
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email&redirect_uri=${redirectUri}`;
  };

  const handleLinkedInLogin = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    if (!clientId || clientId === 'your_linkedin_client_id') {
      setApiError('LinkedIn OAuth is not configured. Use email/password login or add VITE_LINKEDIN_CLIENT_ID to your .env');
      return;
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth-callback?provider=linkedin`);
    const scope = encodeURIComponent('openid profile email');
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  return (
    <div className="mx-auto max-w-md font-sans">
      {/* Glassmorphic card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/60 p-8">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3 py-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/40">
              <Sparkles className="h-3 w-3" /> Verified Skill Proof Platform
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to your TalentForge workspace</p>
          </div>

          {/* Error Alert */}
          {apiError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400">
              {apiError}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all ${
                  errors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-800 focus:border-brand-500 dark:focus:border-brand-500'
                }`}
                placeholder="john@college.edu"
              />
              {errors.email && <p className="text-xs font-medium text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all ${
                    errors.password ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-800 focus:border-brand-500 dark:focus:border-brand-500'
                  }`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-medium text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-500 hover:shadow-brand-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800" /></div>
            <span className="relative bg-white dark:bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">or continue with</span>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGitHubLogin}
              disabled={githubLoading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              <Github className="h-4 w-4" /> GitHub
            </button>
            <button
              type="button"
              onClick={handleLinkedInLogin}
              disabled={linkedinLoading}
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-[#0A66C2] py-2.5 text-xs font-bold text-white hover:bg-[#004182] transition-all shadow-sm"
            >
              <Linkedin className="h-4 w-4" /> LinkedIn
            </button>
          </div>

          {/* Demo credentials hint */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            <p className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              <span className="font-semibold text-brand-500">Student:</span><span>student@college.edu / password123</span>
              <span className="font-semibold text-amber-500">Reviewer:</span><span>reviewer@talentforge.in / Reviewer123!</span>
              <span className="font-semibold text-purple-500">Employer:</span><span>employer@talentforge.in / password123</span>
              <span className="font-semibold text-red-500">Admin:</span><span>admin@talentforge.in / Admin123!</span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            No account?{' '}
            <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
