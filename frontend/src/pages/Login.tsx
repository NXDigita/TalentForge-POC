import { Link } from 'react-router-dom';
import Login from '../components/Login';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center bg-slate-100 p-6">
      <div className="w-full">
        <Login />
        <p className="mt-4 text-center text-sm text-slate-600">
          Don&apos;t have an account? <Link className="text-brand-600" to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
