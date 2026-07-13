import { Link, Outlet } from 'react-router-dom';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex h-screen max-w-6xl flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">TalentForge</h1>
              <p className="text-sm text-slate-500">Performance verified talent marketplace</p>
            </div>
            <nav className="space-x-4 text-slate-700">
              <Link className="hover:text-brand-600" to="/">Home</Link>
              <Link className="hover:text-brand-600" to="/profile">Profile</Link>
              <Link className="hover:text-brand-600" to="/login">Login</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
