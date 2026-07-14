import { Link, Outlet, useLocation } from 'react-router-dom';

export default function AppShell() {
  const location = useLocation();

  const isLinkActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold shadow-md shadow-brand-500/20">
              TF
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900">TalentForge</h1>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">POC Workspace</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const active = isLinkActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-brand-50 text-brand-600 shadow-sm shadow-brand-500/5'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={active ? 'text-brand-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Widget */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-600 text-sm">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">Candidate Account</p>
              <p className="text-[10px] text-slate-400 truncate">Level 1 • Explorer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm shadow-slate-100/10">
          <div>
            <h2 className="text-sm font-medium text-slate-500">
              {location.pathname === '/' && 'Platform Overview'}
              {location.pathname === '/dashboard' && 'Student Dashboard'}
              {location.pathname === '/profile' && 'Psychometric & Skill Profile'}
              {location.pathname === '/login' && 'Account Authentication'}
              {location.pathname === '/register' && 'Platform Onboarding'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-700 shadow-md shadow-brand-500/10"
            >
              Join TalentForge
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
