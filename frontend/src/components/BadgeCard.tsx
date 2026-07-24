import { Award, ShieldCheck, Download, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BadgeData {
  id: string;
  verifyId: string;
  title: string;
  problemTitle?: string;
  score: number;
  status: string;
  pdfUrl?: string;
  createdAt: string;
}

interface BadgeCardProps {
  badge: BadgeData;
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  const formattedDate = new Date(badge.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const verifyUrl = `/verify/${badge.verifyId || badge.id}`;
  const pdfDownloadUrl = badge.pdfUrl || `http://localhost:5000/api/verify/${badge.verifyId || badge.id}/pdf`;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-900/90 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-purple-500/10">
      {/* Top Banner Gradient & Status Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Award className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-slate-400">Issued {formattedDate}</span>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="h-3 w-3" />
          {badge.status || 'AI_VERIFIED'}
        </span>
      </div>

      {/* Main Content: Title & Problem */}
      <div className="my-4 space-y-1.5">
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          {badge.title}
          <Sparkles className="h-3.5 w-3.5 text-amber-400 opacity-80" />
        </h4>
        <p className="text-xs text-slate-400">
          Challenge: <span className="font-medium text-slate-300">{badge.problemTitle || 'Algorithmic Mastery'}</span>
        </p>
      </div>

      {/* Score Badge */}
      <div className="flex items-center justify-between rounded-xl bg-slate-950/80 p-3 border border-slate-800 my-3">
        <span className="text-xs font-medium text-slate-400">Verified AI Score</span>
        <span className="text-sm font-extrabold text-emerald-400 tracking-tight">
          {badge.score} / 100
        </span>
      </div>

      {/* Actions: Verify & Download Certificate */}
      <div className="flex items-center gap-2 pt-2">
        <Link
          to={verifyUrl}
          target="_blank"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600/20 px-3 py-2 text-xs font-semibold text-purple-300 border border-purple-500/30 transition-all hover:bg-purple-600 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Public Verify Page
        </Link>

        <a
          href={pdfDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
        >
          <Download className="h-3.5 w-3.5" />
          PDF
        </a>
      </div>
    </div>
  );
}
