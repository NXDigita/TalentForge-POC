import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8)
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = (data: RegisterForm) => {
    console.log('Register', data);
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            {...register('name')}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-brand-500"
          />
        </div>
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
          Create account
        </button>
      </form>
    </div>
  );
}
