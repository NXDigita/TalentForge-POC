import React from 'react';
import { Award, ShieldCheck, Download, ExternalLink, Sparkles, X, CheckCircle2, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfettiCelebration from './ConfettiCelebration';

interface BadgeCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeTitle?: string;
  problemTitle?: string;
  score?: number;
  status?: string;
  verifyId?: string;
  pdfUrl?: string;
}

export default function BadgeCelebrationModal({
  isOpen,
  onClose,
  badgeTitle = 'Algorithmic Mastery Badge',
  problemTitle = 'Data Structures Challenge',
  score = 98,
  status = 'AI_VERIFIED',
  verifyId,
  pdfUrl,
}: BadgeCelebrationModalProps) {
  if (!isOpen) return null;

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
  const finalVerifyId = verifyId || 'sample-verify-id';
  const verifyPageUrl = `/verify/${finalVerifyId}`;
  const certificatePdfUrl = pdfUrl || `${apiUrl}/verify/${finalVerifyId}/pdf`;

  const isExpertVerified = status === 'EXPERT_VERIFIED' || status === 'Expert Verified';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      {/* Canvas Confetti Explosion Effect */}
      <ConfettiCelebration durationMs={5000} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/90 p-8 shadow-2xl shadow-purple-500/20 text-center space-y-6 z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          aria-label="Close Modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top Animated Badge Icon */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/30 border border-purple-400/40">
          <Award className="h-10 w-10 text-amber-300 animate-pulse" />
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-md">
            <Sparkles className="h-3.5 w-3.5 fill-slate-950" />
          </div>
        </div>

        {/* Celebration Title */}
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3.5 py-1 text-xs font-extrabold text-purple-300 border border-purple-500/30 uppercase tracking-widest">
            🎉 Score ≥ 75 Mastery Achieved!
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white">{badgeTitle}</h2>
          <p className="text-xs text-slate-300">
            Challenge: <strong className="text-purple-300 font-semibold">{problemTitle}</strong>
          </p>
        </div>

        {/* Score & Status Chips */}
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-950/80 p-4 border border-slate-800">
          <div className="space-y-0.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Verified Score</span>
            <span className="text-xl font-black text-emerald-400 tracking-tight">{score} / 100</span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Verification Status</span>
            {isExpertVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/40">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" /> Expert Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                <Bot className="h-3.5 w-3.5 text-emerald-400" /> AI Verified
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link
              to={verifyPageUrl}
              target="_blank"
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:bg-purple-500 active:scale-95"
            >
              <ExternalLink className="h-4 w-4" /> View Public Certificate
            </Link>

            <a
              href={certificatePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold text-slate-200 transition-all hover:bg-slate-700 hover:text-white active:scale-95"
            >
              <Download className="h-4 w-4" /> Download PDF
            </a>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-xl py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Continue Coding
          </button>
        </div>
      </div>
    </div>
  );
}
