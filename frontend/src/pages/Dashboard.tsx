import ProblemBoard from '../components/ProblemBoard';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome to TalentForge. Review your current problems and progress.</p>
      </div>
      <ProblemBoard />
    </div>
  );
}
