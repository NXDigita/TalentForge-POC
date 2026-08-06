import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

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
  const { registerUser, setSession } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';

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
      if (isEmployer) {
        const res = await fetch(`${apiUrl}/auth/register-employer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
            company: companyName || 'Enterprise Employer',
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Employer registration failed');
        if (result.accessToken && result.refreshToken) {
          await setSession(result.accessToken, result.refreshToken);
        }
        navigate('/discover');
      } else {
        await registerUser(data.name, data.email, data.domain, data.password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 440,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      padding: 32,
      boxShadow: '0 1px 2px rgba(17,24,38,.04), 0 16px 40px -16px rgba(17,24,38,.12)',
      color: 'var(--ink)'
    }}>
      <style>{`
        .reg-input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--surface);
          padding: 10px 14px;
          font-size: 14px;
          color: var(--ink);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          box-sizing: border-box;
        }
        .reg-input:focus {
          border-color: var(--indigo);
          box-shadow: 0 0 0 3px rgba(79,70,229,.12);
        }
        .reg-input.error {
          border-color: #EF4444;
        }
        .reg-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: var(--ink2);
          margin-bottom: 6px;
          font-family: 'JetBrains Mono', monospace;
        }
        .reg-btn-primary {
          width: 100%;
          background: var(--indigo);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background .15s, transform .1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .reg-btn-primary:hover {
          background: #4338CA;
        }
        .reg-btn-primary:disabled {
          opacity: .5;
          cursor: not-allowed;
        }
        .reg-tab {
          flex: 1;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all .15s;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', color: 'var(--ink)', margin: 0 }}>Create account</h1>
        <p style={{ fontSize: 13.5, color: 'var(--ink2)', marginTop: 6 }}>Get started with TalentForge verified skill proof</p>
      </div>

      {/* Account Mode Selector */}
      <div style={{ display: 'flex', background: 'var(--tint)', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={() => setIsEmployer(false)}
          className="reg-tab"
          style={!isEmployer ? { background: 'var(--surface)', color: 'var(--ink)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { background: 'transparent', color: 'var(--ink3)' }}
        >
          Candidate Student
        </button>
        <button
          type="button"
          onClick={() => setIsEmployer(true)}
          className="reg-tab"
          style={isEmployer ? { background: 'var(--indigo)', color: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { background: 'transparent', color: 'var(--ink3)' }}
        >
          Employer Recruiter
        </button>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#DC2626', marginBottom: 20, fontWeight: 500 }}>
          {apiError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="reg-label">Full Name</label>
          <input
            {...register('name')}
            className={`reg-input${errors.name ? ' error' : ''}`}
            placeholder="Rohan Sharma"
          />
          {errors.name && (
            <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="reg-label">Email Address</label>
          <input
            type="email"
            {...register('email')}
            className={`reg-input${errors.email ? ' error' : ''}`}
            placeholder="rohan@college.edu"
          />
          {errors.email && (
            <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.email.message}</p>
          )}
        </div>

        {isEmployer ? (
          <div>
            <label className="reg-label">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="reg-input"
              placeholder="Acme Corp"
            />
          </div>
        ) : (
          <div>
            <label className="reg-label">Domain Selection</label>
            <select
              {...register('domain')}
              className={`reg-input${errors.domain ? ' error' : ''}`}
            >
              <option value="cse" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>Computer Science Engineering (CSE)</option>
              <option value="ece" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>Electronics & Communication Engineering (ECE)</option>
            </select>
            {errors.domain && (
              <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.domain.message}</p>
            )}
          </div>
        )}

        <div>
          <label className="reg-label">Password</label>
          <input
            type="password"
            {...register('password')}
            className={`reg-input${errors.password ? ' error' : ''}`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.password.message}</p>
          )}
        </div>

        <button className="reg-btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Creating account...' : 'Create account →'}
        </button>
      </form>

      <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink2)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--indigo)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  );
}
