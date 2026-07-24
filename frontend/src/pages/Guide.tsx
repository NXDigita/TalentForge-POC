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
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does autograded container evaluation work in TalentForge?',
    answer:
      'When you click "Submit Solution", your code is packaged and uploaded to object storage (MinIO/S3). A job is enqueued in BullMQ, which triggers an isolated Docker sandbox worker. Your code is executed against both public and hidden test cases, measuring execution time (ms), memory footprint (MB), and algorithmic Big-O complexity.',
  },
  {
    question: 'Which programming languages are currently supported in the Monaco Editor?',
    answer:
      'TalentForge currently supports Python 3, JavaScript (Node.js 18+), and Java 17. Starter templates are automatically provided when switching languages in the workspace header.',
  },
  {
    question: 'How are On-Chain ERC-721 Blockchain Badges minted?',
    answer:
      'When you achieve a passing evaluation on milestone challenges, an ERC-721 smart contract transaction is issued on the Polygon Amoy testnet. This issues a cryptographically verifiable skill credential linked directly to your candidate wallet address.',
  },
  {
    question: 'What happens if my code encounters TIMEOUT or OOM errors?',
    answer:
      'If your execution exceeds 2000 ms, a TIMEOUT alert is triggered. If memory allocations exceed 256 MB, an OOM (Out Of Memory) alert is displayed. Check for infinite loops or inefficient memory structures and click "Retry Solution".',
  },
  {
    question: 'How does the Claude 3.5 AI Performance Coach work?',
    answer:
      'The AI coach analyzes your execution sub-scores (Correctness, Big-O Complexity, Code Style) and formats 3 targeted coaching recommendations streamed via a live typewriter effect to help you optimize code performance.',
  },
];

export default function Guide() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 font-sans">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute right-40 -bottom-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3 py-1 text-xs font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/40">
            <HelpCircle className="h-3.5 w-3.5" /> Workspace Help Center & Guide
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Platform Workflow & Developer Manual
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Learn how candidate autograding, Monaco split workspace, BullMQ sandboxes, Polygon blockchain credentials, and AI performance coaching operate within TalentForge.
          </p>
        </div>
      </div>

      {/* Section 1: 4-Step Workflow Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-500" /> Platform Workflow Step-by-Step
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Step 1 */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 font-extrabold text-sm">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Challenge</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Browse the Problem Board by domain (CSE/ECE) and tier difficulty (Explorer to Master).
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 font-extrabold text-sm">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Code & Test</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Write solutions in Python, JavaScript, or Java inside the resizable Monaco Editor workspace.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-extrabold text-sm">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sandbox Evaluation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              BullMQ workers run code inside Docker containers, evaluating time (ms) and memory (MB).
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-extrabold text-sm">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">On-Chain Skill Proof</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Passed evaluations issue ERC-721 NFT badges on Polygon Amoy testnet for candidate portfolios.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Tier XP Progression Matrix */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" /> Tier Progression & XP Threshold Matrix
          </h2>
          <span className="text-xs font-semibold text-amber-500">Candidate Levels</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Tier Level</th>
                <th className="py-3 px-4">XP Requirement</th>
                <th className="py-3 px-4">Challenge Types</th>
                <th className="py-3 px-4">On-Chain Badge Unlock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              <tr>
                <td className="py-3.5 px-4 font-bold text-brand-600 dark:text-brand-400 uppercase">
                  Explorer
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">0 - 500 XP</td>
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">Arrays, Strings, Basic Logic</td>
                <td className="py-3.5 px-4 text-emerald-500 font-bold">Explorer ERC-721 NFT</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-blue-500 uppercase">Apprentice</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">501 - 1,200 XP</td>
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">Trees, Graphs, Sorting, Hash Maps</td>
                <td className="py-3.5 px-4 text-emerald-500 font-bold">Apprentice ERC-721 NFT</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-purple-500 uppercase">Builder</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">1,201 - 2,500 XP</td>
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">Dynamic Programming, Concurrency</td>
                <td className="py-3.5 px-4 text-emerald-500 font-bold">Builder ERC-721 NFT</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-amber-500 uppercase">Master</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">2,501+ XP</td>
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">System Architecture & Circuit Validation</td>
                <td className="py-3.5 px-4 text-emerald-500 font-bold">Master Gold ERC-721 NFT</td>
              </tr>
            </tbody>
          </table>
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
