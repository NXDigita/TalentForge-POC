import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Check, Sparkles, X, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import OnboardingTour from './OnboardingTour';
import CopilotDrawer from './CopilotDrawer';
import FeedbackWidget from './FeedbackWidget';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated, switchRole } = useAuth();
  const userRole = (user?.role || 'STUDENT').toUpperCase();

  // Notification Bell State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: 'user-1',
      title: 'Expert Verification Approved! ⭐ 5/5',
      message: 'Your Two Sum solution was approved by Senior Architect. Badge status flipped to Expert Verified.',
      type: 'EXPERT_APPROVAL',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [unreadCount, setUnreadCount] = useState<number>(1);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

  useEffect(() => {
    async function fetchNotifications() {
      // Skip if tab is hidden — no need to poll when user isn't looking
      if (document.visibilityState === 'hidden') return;
      try {
        const res = await api.get(`/students/notifications`);
        if (res.data?.notifications) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // Fallback state retained
      }
    }
    fetchNotifications();
    // Poll every 60s instead of 10s — notifications are not real-time critical
    const interval = setInterval(fetchNotifications, 60_000);
    // Also fetch immediately when the user switches back to the tab
    document.addEventListener('visibilitychange', fetchNotifications);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', fetchNotifications);
    };
  }, [apiUrl]);

  const handleMarkAllRead = async () => {
    try {
      await api.post(`/students/notifications/read`);
    } catch (e) {
      // Fallback update
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const isLinkActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const allNavItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      roles: ['STUDENT', 'ADMIN'],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      name: 'Problems',
      path: '/problems',
      roles: ['STUDENT', 'ADMIN'],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    {
      name: 'Assessment',
      path: '/assessment',
      roles: ['STUDENT', 'ADMIN'],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      name: 'Submissions',
      path: '/submissions',
      roles: ['STUDENT', 'ADMIN'],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Learning Center',
      path: '/learning',
      roles: ['STUDENT', 'ADMIN'],
      icon: (
        <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      name: 'Reviewer Portal',
      path: '/reviewer',
      roles: ['REVIEWER', 'ADMIN'],
      icon: (
        <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      name: 'Discover Talent',
      path: '/discover',
      roles: ['EMPLOYER', 'ADMIN'],
      icon: (
        <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      name: 'Shortlist',
      path: '/shortlist',
      roles: ['EMPLOYER', 'ADMIN'],
      icon: (
        <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    },
    {
      name: 'Leaderboard',
      path: '/leaderboard',
      roles: ['STUDENT', 'REVIEWER', 'EMPLOYER', 'ADMIN'],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      name: 'Profile',
      path: '/profile',
      roles: ['STUDENT', 'REVIEWER', 'EMPLOYER', 'ADMIN'],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'Guide',
      path: '/guide',
      roles: ['STUDENT', 'REVIEWER', 'EMPLOYER', 'ADMIN'],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const navItems = allNavItems.filter((item) => userRole === 'ADMIN' || item.roles.includes(userRole));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold shadow-md shadow-brand-500/20">
              TF
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">TalentForge</h1>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">POC Workspace</span>
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
                    ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User & Role Widget */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-2">
          <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <div className="h-9 w-9 rounded-full bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-sm border border-purple-500/30">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{user?.name || 'Anonymous User'}</p>
                <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-black text-purple-300 border border-purple-500/30">
                  {userRole}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.domain?.toUpperCase() || 'CSE'} • {user?.tier || 'Explorer'}</p>
            </div>
          </div>

          {/* Dev Mode Role Workflow Switcher */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
            <span>Role Workflow:</span>
            <select
              value={userRole}
              onChange={(e) => {
                const newRole = e.target.value;
                switchRole(newRole);
                if (newRole === 'REVIEWER') {
                  navigate('/reviewer');
                } else if (newRole === 'EMPLOYER') {
                  navigate('/discover');
                } else {
                  navigate('/dashboard');
                }
              }}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded px-1.5 py-0.5 font-mono text-[10px] border border-slate-700 focus:outline-none"
            >
              <option value="STUDENT">Student Candidate</option>
              <option value="REVIEWER">Expert Reviewer</option>
              <option value="EMPLOYER">Employer Recruiter</option>
              <option value="ADMIN">Admin Manager</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 shadow-sm transition-colors duration-200">
          <div>
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {location.pathname === '/' && 'Platform Overview'}
              {location.pathname === '/dashboard' && 'Student Dashboard'}
              {location.pathname.startsWith('/problems') && 'Verified Execution Environment'}
              {location.pathname === '/assessment' && 'Diagnostic Psychometric Assessment'}
              {location.pathname === '/reviewer' && 'Expert Reviewer Evaluation Portal'}
              {location.pathname === '/profile' && 'Psychometric & Skill Profile'}
              {location.pathname === '/discover' && 'Employer Recruiter Discover Portal'}
              {location.pathname === '/shortlist' && 'Employer Talent Pipeline & Shortlist'}
              {location.pathname === '/login' && 'Account Authentication'}
              {location.pathname === '/register' && 'Platform Onboarding'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Student Notification Bell with Unread Count */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all shadow-sm"
                aria-label="Student Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Student Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" /> Mark Read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-3">No notifications right now.</p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                            !item.read
                              ? 'bg-purple-500/10 border-purple-500/30 dark:bg-purple-950/30'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-900 dark:text-white flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" /> {item.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {item.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all shadow-sm"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                // Sun Icon
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                // Moon Icon
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-700 shadow-md shadow-brand-500/10"
                >
                  Join TalentForge
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/20 transition-colors duration-200 relative">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
          
          {/* Global Copilot FAB */}
          {isAuthenticated && (
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-500/30 hover:bg-brand-500 transition-transform hover:scale-105 active:scale-95"
              aria-label="Open AI Copilot"
            >
              <Sparkles className="h-6 w-6" />
            </button>
          )}
        </main>
      </div>
      <CopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      <OnboardingTour />
      <FeedbackWidget />
    </div>
  );
}
