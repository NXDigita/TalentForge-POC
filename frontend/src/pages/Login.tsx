import { Link } from 'react-router-dom';
import Login from '../components/Login';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center p-6">
      <div className="w-full">
        <Login />
      </div>
    </div>
  );
}
