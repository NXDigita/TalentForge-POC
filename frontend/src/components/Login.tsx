import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  // Redirect destination
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onSubmit = async (data: LoginForm) => {
    try {
      setApiError(null);
      setIsSubmitting(true);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setApiError(err.response?.data?.error || 'Invalid credentials or connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api') + '/auth/google';
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 border border-slate-100 shadow-xl shadow-slate-100/50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
        <p className="text-sm text-slate-500 mt-1">Sign in to your TalentForge workspace</p>
      </div>

      {apiError && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 border border-red-100 text-xs font-semibold text-red-600">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
          <input
            type="email"
            {...register('email')}
            className={`mt-1.5 w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm outline-none transition-all duration-200 ${
              errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-500 focus:bg-white'
            }`}
            placeholder="john@college.edu"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
          </div>
          <input
            type="password"
            {...register('password')}
            className={`mt-1.5 w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm outline-none transition-all duration-200 ${
              errors.password ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-500 focus:bg-white'
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-700 hover:shadow-brand-500/30 disabled:opacity-50"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <span className="relative bg-white px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">or</span>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.99 0 12 0 7.354 0 3.373 2.673 1.455 6.555l3.81 3.21z"
          />
          <path
            fill="#4285F4"
            d="M23.49 12.275c0-.825-.075-1.62-.21-2.385H12v4.515h6.48a5.54 5.54 0 0 1-2.4 3.63l3.735 2.895c2.18-2.01 3.675-4.965 3.675-8.655z"
          />
          <path
            fill="#FBBC05"
            d="M5.266 14.235L1.455 17.44A11.96 11.96 0 0 0 12 24c2.99 0 5.642-1.09 7.743-2.982l-3.735-2.895a7.11 7.11 0 0 1-4.008 1.132 7.077 7.077 0 0 1-6.734-4.855l-3.81 3.21z"
          />
          <path
            fill="#34A853"
            d="M1.455 6.555l3.81 3.21A7.067 7.067 0 0 1 12 4.91c3.705 0 6.705 3.01 6.705 6.705s-3 6.705-6.705 6.705c-3.705 0-6.705-3.01-6.705-6.705c0-1.295.345-2.5 1.005-3.555l-3.81-3.21A11.94 11.94 0 0 0 1.455 6.555z"
          />
        </svg>
        Continue with Google
      </button>
    </div>
  );
}
