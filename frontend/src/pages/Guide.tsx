import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  BookOpen,
  Code2,
  Cpu,
  Award,
  Terminal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Flame,
  ArrowRight,
  Zap,
  Lock,
  History,
  Trophy,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does the Precheck Security Blocklist (precheck.ts) protect the platform?',
    answer:
      'Before container instantiation, candidate source code is statically scanned for restricted system calls (e.g. Python subprocess/os.system, Node child_process/fs, Java Runtime.getRuntime). If a blocked pattern is detected, execution is halted immediately and marked as BLOCKED pre-run.',
  },
  {
    question: 'How does the Big-O Complexity Grader measure execution scaling (N, 2N, 4N)?',
    answer:
      'The autograder runs test cases across scaled input sizes (N, 2N, 4N) and calculates growth ratios R1 = T(2N)/T(N) and R2 = T(4N)/T(2N). It fits the observed growth to O(1), O(N), O(N log N), or O(N²) and compares it against the problem expected complexity.',
  },
  {
    question: 'How is the Composite Score calculated across evaluations?',
    answer:
      'The final composite score is calculated using a 60/30/10 weighted formula: 60% Algorithmic Correctness + 30% Big-O Complexity + 10% Code Style (pylint, eslint, checkstyle).',
  },
  {
    question: 'How does the Resubmit Cooldown Chip (nextAllowedAt) operate?',
    answer:
      'To prevent submission spam, the backend issues a nextAllowedAt timestamp (60-second window). A live countdown chip displays in the submission interface until the timer expires.',
  },
  {
    question: 'What information is managed inside the 9-Tab Candidate Profile?',
    answer:
      'The Candidate Profile consists of 9 structured tabs: Personal Info, Academic Details, Technical Skills, Achievements, Resume Upload with ATS score, Social Links, Polygon Blockchain Badges, Security Settings, and Recruiter Preferences.',
  },
  {
    question: 'How are On-Chain ERC-721 Blockchain Badges minted?',
    answer:
      'When you achieve a passing evaluation on milestone challenges, an ERC-721 smart contract transaction is issued on the Polygon Amoy testnet, issuing a cryptographically verifiable skill credential linked to your candidate profile.',
  },
];

export default function Guide() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 font-sans text-slate-900 dark:text-slate-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute right-40 -bottom-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3 py-1 text-xs font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/40">
            <HelpCircle className="h-3.5 w-3.5" /> Workspace Help Center & Manual
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            TalentForge Platform Architecture Guide
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Learn how precheck security scanning, Big-O scaling complexity, in-container code linting, 9-tab profile management, and Polygon ERC-721 badges function across TalentForge.
          </p>
        </div>
      </div>

      {/* Section 1: 4-Step Workflow Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-500" /> Platform Evaluation Architecture
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Step 1 */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 font-extrabold text-sm">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security Precheck</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Static regex scanner inspects code pre-run to block dangerous process spawning or file system calls.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 font-extrabold text-sm">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sandbox Execution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              BullMQ workers run code inside isolated Docker containers across scaled input sizes (N, 2N, 4N).
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-extrabold text-sm">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Composite Scoring</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Weighted formula: 60% Correctness + 30% Big-O Complexity + 10% Code Style (pylint/eslint).
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-extrabold text-sm">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">On-Chain Skill Proof</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Passed evaluations issue ERC-721 NFT badges on Polygon Amoy testnet for verified candidate portfolios.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Core Platform Feature Matrix */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> Platform Subsystem Directory
          </h2>
          <span className="text-xs font-semibold text-amber-500">Modules</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-slate-50/50 dark:bg-slate-950/60">
            <div className="flex items-center gap-2 text-brand-500 font-bold text-xs">
              <Trophy className="h-4 w-4" /> Paginated Leaderboard
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top 3 Gold/Silver podium cards, 7-day score trends (+45 green), and cohort filters.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-slate-50/50 dark:bg-slate-950/60">
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
              <History className="h-4 w-4" /> Submission History
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Score trend sparkline chart, attempts matrix, detail modals, and live resubmit cooldown chips.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-slate-50/50 dark:bg-slate-950/60">
            <div className="flex items-center gap-2 text-purple-500 font-bold text-xs">
              <Code2 className="h-4 w-4" /> 9-Tab Profile Manager
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal, Academic, Skills, Achievements, Resume ATS upload, Social Links, and Security.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Interactive FAQ Accordions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-purple-500" /> Frequently Asked Questions (FAQ)
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-slate-900 dark:text-white hover:text-brand-500 transition"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-brand-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-600/20 via-purple-600/10 to-indigo-600/20 p-8 text-center space-y-4">
        <h3 className="text-xl font-extrabold text-white">Ready to test your code?</h3>
        <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
          Head to the Problem Board to solve autograded engineering challenges and earn verified skill proofs.
        </p>
        <Link
          to="/problems"
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-xs font-bold text-white hover:bg-brand-500 transition shadow-lg shadow-brand-500/20"
        >
          Explore Problem Board <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
