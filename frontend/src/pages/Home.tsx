import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

interface Problem {
  id: string;
  title: string;
  tier: string;
  domain: string;
}

export default function Home() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const heroSlides = [
    {
      subtitle: 'CANDIDATE PLATFORM',
      title: 'My code is my resume. No lies. No padding. Just proof.',
      description: 'Forget generic LeetCode drills. Solve real system algorithms, receive instant grading analytics, and publish cryptographic proof of skill directly to recruiters.',
      bullets: [
        'Learn by doing (real algorithm problems)',
        'Instant AI code feedback in 3-5 seconds',
        'Polygon blockchain badge validation (permanent proof)'
      ],
      ctaText: 'Launch Simulation Sandbox',
      ctaLink: '/register',
      visualType: 'terminal'
    },
    {
      subtitle: 'RECRUITER PORTAL',
      title: 'Stop wasting screening time. Get verified engineers in 2 weeks.',
      description: 'Pre-verified engineering talent with skills proven through live execution sandboxes. Browse actual code submissions and bypass resume keywords entirely.',
      bullets: [
        'Filter directly by badge, quality score, and expert rating',
        'Review actual code submissions (GitHub-style interface)',
        'Direct candidate shortlists without recruiter screening backlogs'
      ],
      ctaText: 'Join as Corporate Partner',
      ctaLink: '/register',
      visualType: 'recruiter'
    },
    {
      subtitle: 'FLAGSHIP CHALLENGE',
      title: 'Design and Build Your Own Load Balancer',
      description: 'Our hyper-focused flagship assessment. Code a backend load distributor, balance active request threads, and test against live traffic loads.',
      bullets: [
        'Tests trade-off analysis, system design, and Big O complexity',
        'Intermediate difficulty • 4-6 hours duration • 1000 XP',
        'Earn the expert on-chain "Load Balancer Design Expert" NFT'
      ],
      ctaText: 'Launch Load Balancer Challenge',
      ctaLink: '/register',
      visualType: 'schematic'
    }
  ];

  // Hero Slideshow Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFading, setIsFading] = useState(true);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play slideshow every 6 seconds
  useEffect(() => {
    startSlideTimer();
    return () => stopSlideTimer();
  }, [currentSlide]);

  const startSlideTimer = () => {
    stopSlideTimer();
    slideTimer.current = setInterval(() => {
      handleNextSlide();
    }, 6000);
  };

  const stopSlideTimer = () => {
    if (slideTimer.current) {
      clearInterval(slideTimer.current);
    }
  };

  const handleNextSlide = () => {
    setIsFading(false);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setIsFading(true);
    }, 300);
  };

  const selectSlide = (index: number) => {
    if (index === currentSlide) return;
    setIsFading(false);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsFading(true);
    }, 300);
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
        const response = await axios.get(`${apiUrl}/students/problems`);
        setProblems(response.data);
      } catch (err) {
        console.error('Failed to load problems on landing page:', err);
        // Fallback mock problems if backend is down
        setProblems([
          { id: 'p1', title: 'Basic Arrays', tier: 'Explorer', domain: 'cse' },
          { id: 'p2', title: 'Build Your Own Load Balancer', tier: 'Apprentice', domain: 'cse' },
          { id: 'p3', title: 'SPICE Circuit Node Solver', tier: 'Explorer', domain: 'ece' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const scrollToAssessments = () => {
    document.getElementById('challenges-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#000000] font-sans text-slate-900 dark:text-[#ffffff] selection:bg-[#0070d1]/30 selection:text-white transition-colors duration-200">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 dark:border-[#121314] bg-white/95 dark:bg-[#000000]/95 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0070d1] to-indigo-500 text-white font-bold shadow-md shadow-[#0070d1]/20">
              TF
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold tracking-tight text-slate-950 dark:text-white font-sans">TalentForge</span>
              <span className="rounded-full bg-slate-50 dark:bg-[#121314] border border-slate-200/60 dark:border-[#1f2024] px-2 py-0.5 text-[8px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">v0.1.0-alpha</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
            <a href="#flagship-section" className="transition-all hover:text-[#0070d1] dark:hover:text-white relative py-1 group">
              FLAGSHIP
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0070d1] dark:bg-white transition-all group-hover:w-full"></span>
            </a>
            <a href="#value-matrix" className="transition-all hover:text-[#0070d1] dark:hover:text-white relative py-1 group">
              VALUE MATRIX
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0070d1] dark:bg-white transition-all group-hover:w-full"></span>
            </a>
            <a href="#challenges-section" className="transition-all hover:text-[#0070d1] dark:hover:text-white relative py-1 group">
              CHALLENGES
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0070d1] dark:bg-white transition-all group-hover:w-full"></span>
            </a>
            <a href="#stepper-section" className="transition-all hover:text-[#0070d1] dark:hover:text-white relative py-1 group">
              JOURNEY
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0070d1] dark:bg-white transition-all group-hover:w-full"></span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="rounded-full border border-slate-200 dark:border-[#1f2024] bg-slate-50 dark:bg-[#121314] p-2 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all shadow-sm"
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

            <Link
              to="/login"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all hover:text-[#0070d1] dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-[#0070d1] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-[#0064b7] shadow-md shadow-[#0070d1]/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Slideshow Section (Always Dark Canvas mode for Playstation Trailer aesthetic) */}
      <section className="relative overflow-hidden bg-[#000000] text-[#ffffff] min-h-[580px] flex items-center border-b border-[#121314]">
        <div className={`mx-auto max-w-6xl px-6 py-16 w-full grid gap-12 md:grid-cols-12 items-center relative z-10 transition-all duration-300 ease-in-out ${isFading ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1.5 scale-99'}`}>
          
          {/* Left Column: Copywriting & Actions */}
          <div className="md:col-span-6 space-y-6">
            <span className="inline-flex rounded-full bg-[#0070d1]/10 border border-[#0070d1]/30 px-3.5 py-1 text-[10px] font-bold text-[#53b1ff] uppercase tracking-widest">
              {heroSlides[currentSlide].subtitle}
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.15] font-sans">
              {heroSlides[currentSlide].title}
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              {heroSlides[currentSlide].description}
            </p>

            <ul className="space-y-2 text-xs text-slate-300">
              {heroSlides[currentSlide].bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-[#53b1ff]">✔</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to={heroSlides[currentSlide].ctaLink}
                className="rounded-full bg-[#0070d1] hover:bg-[#0064b7] px-6 py-3 text-xs font-bold text-white transition-all shadow-lg shadow-[#0070d1]/25 tracking-wide"
              >
                {heroSlides[currentSlide].ctaText}
              </Link>
              <button
                onClick={scrollToAssessments}
                className="rounded-full border border-slate-800 bg-[#121314]/50 px-6 py-3 text-xs font-bold text-slate-300 transition-all hover:bg-slate-900 hover:text-white"
              >
                Explore Sandbox list
              </button>
            </div>
          </div>

          {/* Right Column: Visual Mockup Previews */}
          <div className="md:col-span-6 flex justify-center items-center">
            {heroSlides[currentSlide].visualType === 'terminal' && (
              <div className="w-full max-w-md rounded-lg border border-[#1f2024] bg-[#121314] p-4 text-left font-mono text-[10px] text-slate-400 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#1f2024] pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500/80"></span>
                    <span className="h-2 w-2 rounded-full bg-yellow-500/80"></span>
                    <span className="h-2 w-2 rounded-full bg-green-500/80"></span>
                    <span className="ml-1 text-[8px] text-slate-500">evaluate_sandbox.py</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-600">CLIENT: ACTIVE</span>
                </div>
                <p className="text-slate-300">$ npx prisma migrate dev</p>
                <p className="text-green-500">✔ Database connection authenticated against localhost:5432</p>
                <p className="text-slate-300 mt-2">$ npm run test:sandbox</p>
                <p className="text-slate-400">Evaluating mental persistence & learning thresholds...</p>
                <div className="bg-[#1c1d22] p-2.5 my-2 rounded border border-slate-800 text-slate-300">
                  <p className="text-indigo-400 font-bold">PSYCHOMETRIC SCORECARD</p>
                  <p>✔ Logical consistency: 88%</p>
                  <p>✔ Detail checking index: 94%</p>
                  <p>✔ Mental persistence scale: 92%</p>
                </div>
                <p className="text-brand-400 font-bold">🏆 AI autograder: 87/100 verified.</p>
                <p className="text-[#deff20] font-bold">⚡ Minting ERC-721 standard on Polygon...</p>
              </div>
            )}

            {heroSlides[currentSlide].visualType === 'recruiter' && (
              <div className="w-full max-w-md rounded-lg border border-[#1f2024] bg-[#121314] p-4 text-left text-xs shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f2024] pb-2">
                  <span className="font-bold text-slate-300 tracking-wider">RECRUITER SHORTLISTS</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 font-bold">MATCH ENGINE RUNNING</span>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500">FILTER QUERY PARAMS:</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-[#1f2024] text-slate-300 text-[10px]">Score &gt; 80</span>
                    <span className="px-2 py-1 rounded bg-[#1f2024] text-slate-300 text-[10px]">Badge: Verified</span>
                    <span className="px-2 py-1 rounded bg-[#1f2024] text-[#0070d1] font-semibold text-[10px]">Domain: CSE</span>
                  </div>
                </div>

                <div className="bg-[#181818] rounded border border-slate-800 p-2.5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-bold text-white">Karthikeyan T (Top 5%)</span>
                    <span className="font-bold text-[#deff20]">Score: 92/100</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Badge: Load Balancer Design Expert</p>
                  <div className="flex gap-2">
                    <button className="rounded px-2.5 py-1 bg-[#0070d1] text-white text-[9px] font-bold">View Submissions</button>
                    <button className="rounded px-2.5 py-1 bg-slate-800 text-slate-300 text-[9px]">Add to Shortlist</button>
                  </div>
                </div>
              </div>
            )}

            {heroSlides[currentSlide].visualType === 'schematic' && (
              <div className="w-full max-w-md rounded-lg border border-[#1f2024] bg-[#121314] p-5 text-left shadow-2xl relative">
                <div className="text-[9px] font-bold text-slate-500 mb-3 tracking-widest">NETWORK SYSTEM DIAGRAM</div>
                <div className="flex flex-col gap-4 items-center justify-center py-6 border border-slate-800 bg-[#181818] rounded-lg">
                  {/* Mock schematic */}
                  <div className="px-3 py-1.5 rounded-full bg-[#0070d1] text-white text-[10px] font-bold">INCOMING CLIENT TRAFFIC</div>
                  <div className="h-6 w-0.5 bg-slate-700"></div>
                  <div className="px-3 py-1.5 rounded border border-[#53b1ff] text-[#53b1ff] text-[10px] font-bold">LOAD BALANCER ENGINE</div>
                  <div className="flex gap-6 mt-3">
                    <div className="flex flex-col items-center">
                      <div className="h-4 w-0.5 bg-slate-700"></div>
                      <span className="px-2 py-1 rounded bg-[#1f2024] text-[8px]">Worker 1</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-4 w-0.5 bg-slate-700"></div>
                      <span className="px-2 py-1 rounded bg-[#1f2024] text-[8px] border border-green-500/30 text-green-400">Worker 2 (OK)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Indicators (Dots) */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2.5">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => selectSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'w-8 bg-[#0070d1]' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>

      {/* Flagship Section: "Design a Load Balancer" (Pure White chapter) */}
      <section id="flagship-section" className="bg-[#ffffff] text-slate-900 py-20 transition-colors duration-200">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 md:grid-cols-12 items-center">
            {/* Left Content */}
            <div className="md:col-span-5 space-y-4">
              <span className="text-[10px] font-bold text-[#0070d1] tracking-widest uppercase">The Flagship Assessment</span>
              <h2 className="text-3xl font-light text-slate-950 leading-tight">Design a Load Balancer</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Every big-tech platform uses this. Instead of generic algorithms, solve a hyper-focused, real-world backend architectural bottleneck. Validate traffic routing trade-offs, execute correctness, and analyze Big O space-time complexities.
              </p>
              <div className="pt-2">
                <Link
                  to="/register"
                  className="rounded-full bg-[#0070d1] hover:bg-[#0064b7] px-6 py-2.5 text-xs font-bold text-white transition-all shadow-md inline-block"
                >
                  Solve Flagship Challenge
                </Link>
              </div>
            </div>

            {/* Right details cards */}
            <div className="md:col-span-7 grid gap-4">
              <div className="rounded-lg border border-slate-200 bg-[#f5f7fa] p-6">
                <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2">Challenge Parameters</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">DIFFICULTY</p>
                    <p className="font-bold text-slate-800">Intermediate</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">EST. DURATION</p>
                    <p className="font-bold text-slate-800">4-6 Hours</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">REWARD</p>
                    <p className="font-bold text-[#0070d1]">1000 XP (On-chain NFT)</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">SUPPORTED LANGUAGES</p>
                    <p className="font-bold text-slate-800">Python / Java / C++</p>
                  </div>
                </div>
              </div>

              {/* What students, AI, and experts do */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-250 bg-[#f5f7fa] p-5">
                  <h5 className="text-xs font-bold text-slate-900 mb-2.5 uppercase tracking-wide">WHAT AI AUTOGRADES</h5>
                  <ul className="space-y-1.5 text-xs text-slate-500">
                    <li>• Code auto-grading (correctness, speed)</li>
                    <li>• Dynamic test-case validation</li>
                    <li>• Code quality metrics (style & linting)</li>
                    <li>• Big O performance analysis</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-slate-250 bg-[#f5f7fa] p-5">
                  <h5 className="text-xs font-bold text-slate-900 mb-2.5 uppercase tracking-wide">WHAT EXPERTS CHECK</h5>
                  <ul className="space-y-1.5 text-xs text-slate-500">
                    <li>• Manual code quality overview</li>
                    <li>• Validation of design choices</li>
                    <li>• Structural trade-off assessments</li>
                    <li>• Verified approval for Polygon badge</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Value Matrix (PlayStation Blue chapter) */}
      <section id="value-matrix" className="bg-[#0070d1] text-white py-20 transition-colors duration-200">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-bold text-indigo-200 tracking-widest uppercase">Stakeholder Ecosystem</span>
            <h2 className="text-3xl font-light leading-tight">Verification Value for Everyone</h2>
            <p className="text-xs text-indigo-100">
              TalentForge aligns students, engineering departments, and corporate hiring teams through verified execution metrics.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Student card */}
            <div className="rounded-lg border border-[#53b1ff]/30 bg-white/5 p-6 space-y-4 hover:bg-white/10 transition-all">
              <div className="text-[10px] font-bold text-[#deff20] tracking-wider uppercase">FOR CANDIDATES</div>
              <blockquote className="text-sm font-light italic leading-relaxed text-indigo-50">
                &ldquo;My code is my resume. No lies. No padding. Just proof.&rdquo;
              </blockquote>
              <ul className="space-y-2 text-xs text-indigo-100">
                <li>✔ Solve real algo sandboxes</li>
                <li>✔ Instant grading feedback in 3-5 seconds</li>
                <li>✔ Polygon badges prove core capabilities</li>
              </ul>
            </div>

            {/* Department Card */}
            <div className="rounded-lg border border-[#53b1ff]/30 bg-white/5 p-6 space-y-4 hover:bg-white/10 transition-all">
              <div className="text-[10px] font-bold text-[#deff20] tracking-wider uppercase">FOR HOD / ADMINS</div>
              <blockquote className="text-sm font-light italic leading-relaxed text-indigo-50">
                &ldquo;Show AICTE and board management our students are industry-skilled.&rdquo;
              </blockquote>
              <ul className="space-y-2 text-xs text-indigo-100">
                <li>✔ Real-time student skill dashboards</li>
                <li>✔ Industry-ready candidate reporting</li>
                <li>✔ Boost placements and corporate links</li>
              </ul>
            </div>

            {/* Recruiter Card */}
            <div className="rounded-lg border border-[#53b1ff]/30 bg-white/5 p-6 space-y-4 hover:bg-white/10 transition-all">
              <div className="text-[10px] font-bold text-[#deff20] tracking-wider uppercase">FOR RECRUITERS</div>
              <blockquote className="text-sm font-light italic leading-relaxed text-indigo-50">
                &ldquo;Stop wasting time screening. Get verified engineers in 2 weeks.&rdquo;
              </blockquote>
              <ul className="space-y-2 text-xs text-indigo-100">
                <li>✔ Pre-validated candidate capabilities</li>
                <li>✔ Bypass resume keyword filtering</li>
                <li>✔ Review actual code (GitHub-style interface)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Showcase (Canvas Light / Dark responsive) */}
      <section id="challenges-section" className="border-t border-slate-100 dark:border-[#121314] py-20 bg-white dark:bg-[#000000] transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[10px] font-bold text-[#0070d1] tracking-widest uppercase">Challenge Board</span>
              <h2 className="text-2xl font-light text-slate-950 dark:text-white mt-1">Live Coding Assessments</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Launch a task to verify your engineering capabilities on the Polygon testnet.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></span>
                Sandbox Engine Online
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((s) => (
                <div key={s} className="h-44 animate-pulse rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20"></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="group relative rounded-lg border border-slate-200 dark:border-[#1f2024] bg-[#f5f7fa] dark:bg-[#121314] p-6 hover:border-[#0070d1] transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      problem.domain === 'cse' 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-[#53b1ff] border border-blue-500/25' 
                        : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/25'
                    }`}>
                      {problem.domain.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">{problem.tier}</span>
                  </div>

                  <h4 className="text-base font-semibold text-slate-950 dark:text-white mb-2 truncate">{problem.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Interactive sandbox simulation designed to evaluate performance and issue verification credentials.
                  </p>

                  <button
                    onClick={() => navigate('/register')}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0070d1] hover:bg-[#0064b7] py-2 text-xs font-bold text-white transition-all tracking-wide shadow"
                  >
                    Launch Simulation
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stepper Section (Alternating Light / Dark Background) */}
      <section id="stepper-section" className="border-t border-slate-100 dark:border-[#121314] py-20 bg-slate-50/50 dark:bg-[#121314]/30 transition-colors duration-200">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#0070d1] tracking-widest uppercase">Workflow</span>
            <h2 className="text-2xl font-light text-slate-950 dark:text-white">How TalentForge Works</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our streamlined on-chain evaluation and review steps.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4 relative">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="text-4xl font-light text-slate-200 dark:text-slate-800">01</div>
              <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">Create Profile</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect your account or authenticate via passport Google OAuth configuration.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="text-4xl font-light text-slate-200 dark:text-slate-800">02</div>
              <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">Launch Challenge</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Select your engineering domain and load the flagship Load Balancer challenge.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="text-4xl font-light text-slate-200 dark:text-slate-800">03</div>
              <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">AI + Expert Review</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Receive instant AI execution scores in 3-5 seconds followed by manual reviewer validation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="text-4xl font-light text-slate-200 dark:text-slate-800">04</div>
              <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">Mint Credentials</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Receive verified credentials directly minted as standard ERC-721 badges to the Polygon network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Block */}
      <section className="border-t border-slate-100 dark:border-[#121314] bg-[#ffffff] dark:bg-[#000000] py-20 text-center transition-colors duration-200">
        <div className="mx-auto max-w-4xl px-6 space-y-6">
          <h2 className="text-3xl font-light text-slate-950 dark:text-white">Ready to lock verified proofs?</h2>
          <p className="mx-auto max-w-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Forget resume padding. Showcase compiled code solutions, complete simulations, and establish verified credentials today.
          </p>
          <div>
            <Link
              to="/register"
              className="inline-flex rounded-full bg-[#0070d1] hover:bg-[#0064b7] px-8 py-3.5 text-xs font-bold text-white transition-all shadow-lg shadow-[#0070d1]/10 tracking-wider"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-[#121314] bg-slate-50 dark:bg-[#000000] py-10 text-[10px] text-slate-500 dark:text-slate-600 transition-colors duration-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-5 rounded-md bg-[#0070d1] flex items-center justify-center text-[10px] text-white font-bold">
              TF
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-400">© 2026 TalentForge. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold uppercase tracking-wider">
            <a href="#" className="hover:text-[#0070d1] dark:hover:text-white">API Docs</a>
            <a href="#" className="hover:text-[#0070d1] dark:hover:text-white">Terms</a>
            <a href="#" className="hover:text-[#0070d1] dark:hover:text-white">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
