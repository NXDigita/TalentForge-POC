import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = (data: LoginForm) => {
    console.log('Login', data);
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            {...register('email')}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            {...register('password')}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-brand-500"
          />
        </div>
        <button className="w-full rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
