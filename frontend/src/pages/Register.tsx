import { Link } from 'react-router-dom';
import Register from '../components/Register';

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center bg-slate-100 p-6">
      <div className="w-full">
        <Register />
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account? <Link className="text-brand-600" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
