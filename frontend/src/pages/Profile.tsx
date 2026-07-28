import axios from 'axios';
import {
  Award,
  Building,
  Code2,
  ExternalLink,
  FileCheck,
  FileText,
  Github,
  Globe,
  GraduationCap,
  Link2,
  Linkedin,
  Lock,
  Mail,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  User,
  Users,
  CheckCircle2,
  Star,
  Activity,
  Key,
  Database,
  Terminal,
  Cpu,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import BadgeCard, { BadgeData } from '../components/BadgeCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserBadges } from '../services/api';

type CandidateTabType =
  | 'personal'
  | 'academic'
  | 'skills'
  | 'achievements'
  | 'resume'
  | 'social'
  | 'blockchain'
  | 'security'
  | 'preferences';

export default function Profile() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const userRole = (user?.role || 'STUDENT').toUpperCase();

  // Return role-specific view
  if (userRole === 'REVIEWER') {
    return <ReviewerProfileView />;
  } else if (userRole === 'EMPLOYER') {
    return <EmployerProfileView />;
  } else if (userRole === 'ADMIN') {
    return <AdminProfileView />;
  } else {
    return <StudentCandidateProfileView />;
  }
}

/* ==========================================================================
   1. STUDENT CANDIDATE PROFILE VIEW
   ========================================================================== */
function StudentCandidateProfileView() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<CandidateTabType>('personal');
  const [saving, setSaving] = useState(false);

  // 1. Personal Information State
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user?.name || 'Demo Student');
  const [mobileNumber, setMobileNumber] = useState('+91 98765 43210');
  const [dob, setDob] = useState('2003-05-15');
  const [gender, setGender] = useState('Male');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Tamil Nadu');
  const [city, setCity] = useState('Chennai');

  // 2. Academic Information State
  const [college, setCollege] = useState('Anna University (CEG Campus)');
  const [degree, setDegree] = useState('B.Tech');
  const [department, setDepartment] = useState(user?.domain === 'ece' ? 'ECE' : 'CSE');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [rollNumber, setRollNumber] = useState('2021CSE1042');
  const [cgpa, setCgpa] = useState('8.92');

  // 3. Skills State
  const [skills, setSkills] = useState([
    { name: 'Python 3', level: 'Expert' },
    { name: 'Data Structures & Algorithms', level: 'Expert' },
    { name: 'TypeScript / React', level: 'Advanced' },
    { name: 'Node.js & Express', level: 'Advanced' },
    { name: 'PostgreSQL / Prisma', level: 'Intermediate' },
    { name: 'Docker & Microservices', level: 'Intermediate' },
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Advanced');

  // 4. Achievements State
  const [achievements, setAchievements] = useState([
    { title: 'Top 5% Rank - TalentForge Algorithmic Sprint 2026', date: '2026-06-10', issuer: 'TalentForge' },
    { title: 'LeetCode Knight Badge (Rating 1850+)', date: '2026-04-20', issuer: 'LeetCode' },
    { title: '1st Place - National Inter-College Hackathon', date: '2025-11-15', issuer: 'Anna University' },
  ]);
  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchIssuer, setNewAchIssuer] = useState('');

  // 4b. AI Verified Badges State
  const [userBadges, setUserBadges] = useState<BadgeData[]>([]);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const badges = await getUserBadges();
        if (badges && badges.length > 0) {
          setUserBadges(badges);
        } else {
          setUserBadges([
            {
              id: 'sample-badge-1',
              verifyId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              title: 'Two Sum Algorithmic Mastery',
              problemTitle: 'Two Sum',
              score: 98,
              status: 'AI_VERIFIED',
              createdAt: '2026-07-20T10:00:00Z',
            },
            {
              id: 'sample-badge-2',
              verifyId: '7b94e102-881a-4d2c-9a4f-1234567890ab',
              title: 'Distributed Systems Concurrency',
              problemTitle: 'LRU Cache System',
              score: 95,
              status: 'EXPERT_VERIFIED',
              createdAt: '2026-07-22T14:30:00Z',
            },
          ]);
        }
      } catch (err) {
        console.warn('Failed to load badges:', err);
      }
    }
    fetchBadges();
  }, []);

  // 5. Resume State
  const [resumeFileName, setResumeFileName] = useState<string | null>('Karthikeyan_Software_Engineer_Resume.pdf');
  const [resumeUploadDate, setResumeUploadDate] = useState('2026-07-01');

  // 6. Social Links State
  const [githubUrl, setGithubUrl] = useState('https://github.com/tkarthikeyan');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/karthikeyan-dev');
  const [portfolioUrl, setPortfolioUrl] = useState('https://karthikeyan.dev');
  const [leetcodeHandle, setLeetcodeHandle] = useState('tkarthikeyan');

  // 8. Privacy & Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 9. Preferences State
  const [recruiterVisible, setRecruiterVisible] = useState(true);

  const handleSave = (sectionName: string) => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(`${sectionName} updated successfully!`);
    }, 500);
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
    toast.success(`Skill "${newSkillName}" added!`);
  };

  const removeSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
    toast.info('Skill removed');
  };

  const addAchievement = () => {
    if (!newAchTitle.trim()) return;
    setAchievements([
      ...achievements,
      { title: newAchTitle.trim(), issuer: newAchIssuer || 'Self Verified', date: new Date().toISOString().split('T')[0] },
    ]);
    setNewAchTitle('');
    setNewAchIssuer('');
    toast.success('Achievement added!');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        toast.success('Profile photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
      setResumeUploadDate(new Date().toISOString().split('T')[0]);
      toast.success(`Uploaded ${file.name} (Parsed ATS Score: 94%)`);
    }
  };

  const tabs: { id: CandidateTabType; label: string; icon: any }[] = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code2 },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'social', label: 'Social Links', icon: Link2 },
    { id: 'blockchain', label: 'Blockchain', icon: ShieldCheck },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-sans text-slate-900 dark:text-slate-100">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-2xl font-extrabold text-white shadow-xl border-2 border-white/20 overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  fullName.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-bold gap-1">
                <Upload className="h-4 w-4" /> Change
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{fullName}</h1>
                <span className="rounded-md bg-brand-50 dark:bg-brand-950/50 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/40 uppercase">
                  {department} • {degree}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Candidate Student • Verified Technical & Psychometric Proof Profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-500 border border-emerald-500/20 shadow-sm">
            <ShieldCheck className="h-4 w-4" /> Polygon Verified Candidate
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto pb-1 select-none">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Personal */}
      {activeTab === 'personal' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5 text-brand-500" /> Personal Information
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address (Read Only)</label>
              <input
                type="email"
                value={user?.email || 'student@college.edu'}
                disabled
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mobile Number</label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleSave('Personal Information')}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-500/20"
            >
              <Save className="h-4 w-4" /> Save Personal Details
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Achievements & Badges */}
      {activeTab === 'achievements' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" /> AI Verified Badges & Certificates
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Resume */}
      {activeTab === 'resume' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" /> Resume Upload & Parsing
            </h2>
          </div>
          <div className="relative rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-8 text-center space-y-3">
            <Upload className="mx-auto h-10 w-10 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload ATS PDF Resume</h3>
            <label className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white cursor-pointer shadow-md">
              <FileCheck className="h-4 w-4" /> Select File
              <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* Fallback tabs preview */}
      {activeTab !== 'personal' && activeTab !== 'achievements' && activeTab !== 'resume' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white capitalize">{activeTab} Settings</h2>
          <p className="text-xs text-slate-400">Candidate profile settings saved.</p>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   2. EXPERT REVIEWER PROFILE VIEW
   ========================================================================== */
function ReviewerProfileView() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-sans text-slate-100">
      {/* Reviewer Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-2xl font-extrabold text-white shadow-xl border-2 border-purple-400/30">
              <ShieldCheck className="h-10 w-10 text-purple-200" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{user?.name || 'Senior Expert Reviewer'}</h1>
                <span className="rounded-md bg-purple-500/20 px-2.5 py-0.5 text-xs font-black text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                  Level 4 Master Evaluator
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Verified Code Evaluation Authority • {user?.email || 'reviewer@talentforge.in'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-purple-500/20 px-4 py-2 text-xs font-extrabold text-purple-300 border border-purple-500/40 shadow-md">
            <Award className="h-4 w-4 text-amber-400" /> Expert Verified Authority
          </div>
        </div>
      </div>

      {/* Evaluation Performance Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Submissions Reviewed</span>
          <span className="text-2xl font-black text-purple-400 font-mono">28 Evaluated</span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Approval Rate</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">89.3%</span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Rating Given</span>
          <span className="text-2xl font-black text-amber-400 font-mono">⭐ 4.95 / 5.0</span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Evaluation Time</span>
          <span className="text-2xl font-black text-indigo-400 font-mono">&lt; 4.2 Hours</span>
        </div>
      </div>

      {/* Reviewer Domain Expertise & Recent Log */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-400" /> Evaluation Domain Competencies
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="font-semibold">Distributed Systems & Load Balancers</span>
              <span className="text-emerald-400 font-bold">Expert Master</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="font-semibold">Data Structures & O(1) Cache Evictions</span>
              <span className="text-emerald-400 font-bold">Senior Auditor</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="font-semibold">Rate Limiters & Concurrency Queues</span>
              <span className="text-emerald-400 font-bold">Senior Auditor</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" /> Recent Expert Audits Log
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Build a Load Balancer</p>
                <p className="text-[10px] text-slate-400">Approved • ⭐ 5/5 Stars</p>
              </div>
              <span className="text-[10px] text-purple-300 font-mono">2h ago</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Two Sum Algorithm</p>
                <p className="text-[10px] text-slate-400">Approved • ⭐ 5/5 Stars</p>
              </div>
              <span className="text-[10px] text-purple-300 font-mono">1d ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. EMPLOYER RECRUITER PROFILE VIEW
   ========================================================================== */
function EmployerProfileView() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-sans text-slate-100">
      {/* Employer Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-2xl font-extrabold text-white shadow-xl border-2 border-indigo-400/30">
              <Users className="h-10 w-10 text-indigo-200" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{user?.name || 'Enterprise Recruiter'}</h1>
                <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-xs font-black text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                  Enterprise Tier
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Stripe Tech Talent Acquisition • {user?.email || 'employer@talentforge.in'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-indigo-500/20 px-4 py-2 text-xs font-extrabold text-indigo-300 border border-indigo-500/40 shadow-md">
            <Building className="h-4 w-4 text-indigo-400" /> Verified Recruiter Account
          </div>
        </div>
      </div>

      {/* Recruitment Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Shortlisted Talent</span>
          <span className="text-2xl font-black text-amber-400 font-mono">14 Candidates</span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Code Samples Inspected</span>
          <span className="text-2xl font-black text-indigo-400 font-mono">42 Inspected</span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Candidate Searches</span>
          <span className="text-2xl font-black text-purple-400 font-mono">88 Queries</span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Code Inspection Privacy</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">Unlocked</span>
        </div>
      </div>

      {/* API Key & ATS Integration Section */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="h-5 w-5 text-indigo-400" /> TalentForge Employer API Key & Webhooks
        </h3>
        <div className="space-y-4 max-w-2xl text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live Recruiter API Key</label>
            <code className="block rounded-xl bg-slate-950 p-3 font-mono text-indigo-300 border border-slate-800">
              tf_live_emp_98f3102476aa89bc4412
            </code>
          </div>
          <p className="text-slate-400">
            Integrate candidate scores and verified psychometrics directly into your ATS (Greenhouse, Lever).
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. SYSTEM ADMINISTRATOR PROFILE VIEW
   ========================================================================== */
function AdminProfileView() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-sans text-slate-100">
      {/* Admin Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-2xl font-extrabold text-white shadow-xl border-2 border-emerald-400/30">
              <Cpu className="h-10 w-10 text-emerald-200" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{user?.name || 'System Administrator'}</h1>
                <span className="rounded-md bg-emerald-500/20 px-2.5 py-0.5 text-xs font-black text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  Master System Control
                </span>
              </div>
              <p className="text-xs text-slate-300">
                TalentForge Platform Admin • {user?.email || 'admin@talentforge.in'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/20 px-4 py-2 text-xs font-extrabold text-emerald-300 border border-emerald-500/40 shadow-md">
            <Activity className="h-4 w-4 text-emerald-400" /> System Health: 100% Operational
          </div>
        </div>
      </div>

      {/* Platform System Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registered Users</span>
          <span className="text-2xl font-black text-white font-mono">1,420 Active</span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Daily Sandbox Jobs</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">3,840 Executed</span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nightly DB Backup Cron</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">S3 Active (14-Day)</span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-1 backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active AI Provider</span>
          <span className="text-2xl font-black text-purple-400 font-mono">Ollama / Claude</span>
        </div>
      </div>
    </div>
  );
}
