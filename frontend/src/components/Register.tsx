import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  domain: z.enum(['cse', 'ece'] as const, {
    message: 'Please select your domain (CSE or ECE)'
  })
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      domain: 'cse'
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setApiError(null);
      setIsSubmitting(true);
      await registerUser(data.name, data.email, data.domain, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 border border-slate-100 shadow-xl shadow-slate-100/50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create Account</h2>
        <p className="text-sm text-slate-500 mt-1">Get started with TalentForge performance testing</p>
      </div>

      {apiError && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 border border-red-100 text-xs font-semibold text-red-600">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Name</label>
          <input
            {...register('name')}
            className={`mt-1.5 w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm outline-none transition-all duration-200 ${
              errors.name ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-500 focus:bg-white'
            }`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{errors.name.message}</p>
          )}
        </div>

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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Domain Selection</label>
          <select
            {...register('domain')}
            className={`mt-1.5 w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm outline-none transition-all duration-200 ${
              errors.domain ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-500 focus:bg-white'
            }`}
          >
            <option value="cse">Computer Science Engineering (CSE)</option>
            <option value="ece">Electronics & Communication Engineering (ECE)</option>
          </select>
          {errors.domain && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{errors.domain.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
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
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
