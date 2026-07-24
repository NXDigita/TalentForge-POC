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
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import BadgeCard, { BadgeData } from '../components/BadgeCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

type TabType =
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

  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [saving, setSaving] = useState(false);

  // 1. Personal Information State
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user?.name || 'Karthikeyan');
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
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await axios.get(`${apiUrl}/students/badges`, { withCredentials: true });
        setUserBadges(res.data || []);
      } catch (err) {
        console.warn('Failed to load badges:', err);
      }
    }
    fetchBadges();
  }, [apiUrl]);

  // 5. Resume State
  const [resumeFileName, setResumeFileName] = useState<string | null>('Karthikeyan_Software_Engineer_Resume.pdf');
  const [resumeUploadDate, setResumeUploadDate] = useState('2026-07-01');

  // 6. Social Links State
  const [githubUrl, setGithubUrl] = useState('https://github.com/tkarthikeyan');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/karthikeyan-dev');
  const [portfolioUrl, setPortfolioUrl] = useState('https://karthikeyan.dev');
  const [leetcodeHandle, setLeetcodeHandle] = useState('tkarthikeyan');
  const [codechefHandle, setCodechefHandle] = useState('karthik_dev');

  // 8. Privacy & Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enable2FA, setEnable2FA] = useState(false);

  // 9. Preferences State
  const [recruiterVisible, setRecruiterVisible] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Save handler with Sonner Toast
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

  const tabs: { id: TabType; label: string; icon: any }[] = [
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
      {/* Top Candidate Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute right-40 -bottom-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Profile Photo Uploader Avatar */}
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
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {fullName}
                </h1>
                <span className="rounded-md bg-brand-50 dark:bg-brand-950/50 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/40 uppercase">
                  {department} • {degree}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {user?.email || 'student@college.edu'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-slate-400" /> {college}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-500 border border-emerald-500/20 shadow-sm">
            <ShieldCheck className="h-4 w-4" /> Polygon Verified Candidate
          </div>
        </div>
      </div>

      {/* 9 Tab Navigation Toolbar */}
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

      {/* Tab 1: 👤 Personal Information */}
      {activeTab === 'personal' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-brand-500" /> Personal Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage your candidate identity details. Fields marked with <span className="text-red-500">*</span> are required.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            {/* Email Address (Read Only) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address <span className="text-red-500">*</span> (Read Only)
              </label>
              <input
                type="email"
                value={user?.email || 'student@college.edu'}
                disabled
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mobile Number
              </label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>

            {/* State */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleSave('Personal Information')}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition shadow-lg shadow-brand-500/20"
            >
              <Save className="h-4 w-4" /> Save Personal Details
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: 🎓 Academic Information */}
      {activeTab === 'academic' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" /> Academic Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Specify your university enrollment and degree path. Fields marked with <span className="text-red-500">*</span> are required.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* College / University */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                College / University <span className="text-red-500">*</span>
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="Anna University (CEG Campus)">Anna University (CEG Campus)</option>
                <option value="Indian Institute of Technology (IIT Madras)">IIT Madras</option>
                <option value="National Institute of Technology (NIT Trichy)">NIT Trichy</option>
                <option value="BITS Pilani">BITS Pilani</option>
                <option value="Vellore Institute of Technology (VIT)">VIT Vellore</option>
                <option value="SRM Institute of Science and Technology">SRM University</option>
                <option value="Delhi Technological University (DTU)">DTU Delhi</option>
              </select>
            </div>

            {/* Degree */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Degree <span className="text-red-500">*</span>
              </label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="B.Tech">B.Tech - Bachelor of Technology</option>
                <option value="B.E.">B.E. - Bachelor of Engineering</option>
                <option value="M.Tech">M.Tech - Master of Technology</option>
                <option value="B.Sc">B.Sc - Computer Science</option>
                <option value="M.Sc">M.Sc - Data Science</option>
              </select>
            </div>

            {/* Department / Branch */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Department / Branch <span className="text-red-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="CSE">CSE - Computer Science & Engineering</option>
                <option value="ECE">ECE - Electronics & Communication</option>
                <option value="IT">IT - Information Technology</option>
                <option value="EEE">EEE - Electrical & Electronics</option>
                <option value="AI & ML">AI & ML - Artificial Intelligence</option>
              </select>
            </div>

            {/* Year of Study */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Year of Study <span className="text-red-500">*</span>
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            {/* Graduation Year */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Graduation Year <span className="text-red-500">*</span>
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>

            {/* Roll Number / Student ID */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Roll Number / Student ID
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* CGPA / Percentage */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                CGPA / Percentage
              </label>
              <input
                type="text"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="e.g. 8.92 or 89.2%"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleSave('Academic Information')}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition shadow-lg shadow-brand-500/20"
            >
              <Save className="h-4 w-4" /> Save Academic Profile
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: 💻 Skills */}
      {activeTab === 'skills' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="h-5 w-5 text-purple-500" /> Technical Skills & Domain Proficiency
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add technical programming languages, frameworks, and engineering domains.
            </p>
          </div>

          {/* Add New Skill Input Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <input
              type="text"
              placeholder="e.g. Golang, GraphQL, Rust..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <button
              onClick={addSkill}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 transition"
            >
              <Plus className="h-4 w-4" /> Add Skill
            </button>
          </div>

          {/* Skills Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {skills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{skill.name}</h4>
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase">
                    {skill.level}
                  </span>
                </div>
                <button
                  onClick={() => removeSkill(idx)}
                  className="rounded-lg p-1 text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: 🏆 Achievements */}
      {activeTab === 'achievements' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-8">
          {/* AI Verified Badges Gallery (S9) */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" /> AI Verified Badges & Certificates (S9)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cryptographically sealed achievements issued automatically for evaluation scores ≥ 75.
                </p>
              </div>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                {userBadges.length} Issued
              </span>
            </div>

            {userBadges.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center space-y-2">
                <Sparkles className="h-6 w-6 text-purple-400 mx-auto" />
                <p className="text-xs font-bold text-slate-300">No AI Verified Badges earned yet</p>
                <p className="text-[11px] text-slate-500">
                  Complete algorithmic challenges with a score ≥ 75 to automatically unlock your verified badges & PDF certificates.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            )}
          </div>

          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Honors, Contest Ranks & Certifications
            </h2>
          </div>

          {/* Add Achievement Form */}
          <div className="grid gap-3 sm:grid-cols-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <input
              type="text"
              placeholder="Achievement Title / Rank"
              value={newAchTitle}
              onChange={(e) => setNewAchTitle(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <input
              type="text"
              placeholder="Issuing Authority (e.g. LeetCode, AWS)"
              value={newAchIssuer}
              onChange={(e) => setNewAchIssuer(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              onClick={addAchievement}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 transition"
            >
              <Plus className="h-4 w-4" /> Add Achievement
            </button>
          </div>

          <div className="space-y-3">
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ach.title}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {ach.issuer} • {ach.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: 📄 Resume */}
      {activeTab === 'resume' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" /> Resume Upload & ATS Parsing
            </h2>
          </div>

          {/* Upload Dropzone */}
          <div className="relative rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-8 text-center space-y-3">
            <Upload className="mx-auto h-10 w-10 text-brand-500 animate-bounce" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Drag and drop your PDF or DOCX resume here
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Files up to 10MB supported. Automatically parsed for candidate skills verification.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white cursor-pointer hover:bg-brand-500 transition shadow-md">
              <FileCheck className="h-4 w-4" /> Browse File
              <input type="file" accept=".pdf,.docx" onChange={handleResumeUpload} className="hidden" />
            </label>
          </div>

          {/* Uploaded File Preview */}
          {resumeFileName && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-brand-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{resumeFileName}</h4>
                  <span className="text-[10px] text-emerald-500 font-semibold">
                    Uploaded on {resumeUploadDate} • ATS Compatibility Score: 94%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.info('Previewing resume PDF artifact...')}
                  className="rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-white"
                >
                  Preview
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: 🔗 Social Links */}
      {activeTab === 'social' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Link2 className="h-5 w-5 text-indigo-500" /> Professional & Developer Profiles
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Github className="h-4 w-4" /> GitHub Profile URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Linkedin className="h-4 w-4" /> LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="h-4 w-4" /> Portfolio Website
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Code2 className="h-4 w-4" /> LeetCode Handle
              </label>
              <input
                type="text"
                value={leetcodeHandle}
                onChange={(e) => setLeetcodeHandle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleSave('Social Links')}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition shadow-lg shadow-brand-500/20"
            >
              <Save className="h-4 w-4" /> Save Links
            </button>
          </div>
        </div>
      )}

      {/* Tab 7: 🪙 Blockchain Credentials */}
      {activeTab === 'blockchain' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" /> On-Chain Skill Badges (ERC-721)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Polygon Amoy Testnet verifiable credentials minted upon sandbox evaluation passes.
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/20">
              Connected Wallet
            </span>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">TalentForge Explorer Badge NFT #0042</h3>
                  <p className="text-xs text-slate-400">Minted on Polygon Amoy Testnet</p>
                </div>
              </div>

              <a
                href="https://amoy.polygonscan.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition"
              >
                PolygonScan <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: 🔒 Privacy & Security */}
      {activeTab === 'security' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" /> Account Security & Password
            </h2>
          </div>

          <div className="max-w-xl space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                if (newPassword && newPassword === confirmPassword) {
                  handleSave('Password');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                } else {
                  toast.error('Passwords do not match');
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition shadow-lg shadow-brand-500/20"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* Tab 9: ⚙️ Preferences */}
      {activeTab === 'preferences' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-brand-500" /> Platform Preferences & Recruiter Visibility
            </h2>
          </div>

          <div className="space-y-4 max-w-xl">
            {/* Recruiter Visibility Toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Enterprise Recruiter Visibility
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allow verified partner companies to discover your skill proofs.
                </p>
              </div>
              <button
                onClick={() => {
                  setRecruiterVisible(!recruiterVisible);
                  toast.info(`Recruiter visibility ${!recruiterVisible ? 'enabled' : 'disabled'}`);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  recruiterVisible ? 'bg-brand-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    recruiterVisible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Theme Preference Toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  PlayStation Design System Theme
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Current theme: <span className="font-bold uppercase text-brand-500">{theme}</span> Mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Toggle Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
