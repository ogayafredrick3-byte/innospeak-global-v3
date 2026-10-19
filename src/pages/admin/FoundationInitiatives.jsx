import { Target, TrendingUp, Users, DollarSign, Plus } from 'lucide-react';
import { FOUNDATION_INITIATIVES } from '../../components/sections/foundation/foundationData.js';

export default function FoundationInitiatives() {
  const totalGoal = FOUNDATION_INITIATIVES.reduce((s, i) => s + i.goal, 0);
  const totalRaised = FOUNDATION_INITIATIVES.reduce((s, i) => s + i.raised, 0);
  const totalBeneficiaries = FOUNDATION_INITIATIVES.reduce((s, i) => s + i.beneficiaries, 0);
  const progress = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
              <Target size={20} />
            </div>
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-wider text-emerald-700">
                Foundation
              </p>
              <h1 className="font-display text-2xl font-bold text-navy-900">
                Initiatives & Funding
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-navy-600">
            Track progress on active Foundation initiatives. Edit in <code className="rounded bg-cream px-1.5 py-0.5 font-mono text-xs">foundationData.js</code>.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Add via foundationData.js for now"
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-navy-200 bg-white px-4 py-2.5 font-body text-sm font-bold text-navy-500 opacity-60"
        >
          <Plus size={15} /> Add initiative
        </button>
      </header>

      {/* Summary tiles */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile icon={Target} label="Active initiatives" value={FOUNDATION_INITIATIVES.length} />
        <SummaryTile icon={Users} label="Beneficiaries targeted" value={totalBeneficiaries} />
        <SummaryTile icon={DollarSign} label="Funding goal" value={`$${totalGoal.toLocaleString()}`} />
        <SummaryTile icon={TrendingUp} label="Raised overall" value={`$${totalRaised.toLocaleString()}`} sub={`${progress}% of goal`} />
      </div>

      {/* Initiative cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        {FOUNDATION_INITIATIVES.map((initiative) => {
          const pct = initiative.goal > 0 ? Math.min((initiative.raised / initiative.goal) * 100, 100) : 0;
          return (
            <div key={initiative.id} className="rounded-2xl border border-navy-100 bg-white shadow-sm">
              <div className="h-1.5 w-full overflow-hidden rounded-t-2xl bg-emerald-100">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: `${pct}%` }} />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    {initiative.category}
                  </span>
                  <span className="font-body text-xs font-bold text-navy-500">
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-navy-900">
                  {initiative.title}
                </h3>
                <p className="mt-1 font-body text-sm leading-6 text-navy-600">
                  {initiative.description}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-navy-100 pt-4 text-xs">
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-wider text-navy-400">Raised</p>
                    <p className="mt-0.5 font-body font-bold text-navy-900">${initiative.raised.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-wider text-navy-400">Goal</p>
                    <p className="mt-0.5 font-body font-bold text-navy-900">${initiative.goal.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon size={18} />
      </div>
      <p className="mt-3 font-body text-[11px] font-bold uppercase tracking-wider text-navy-500">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-navy-900">{value}</p>
      {sub && <p className="mt-0.5 font-body text-xs text-emerald-700">{sub}</p>}
    </div>
  );
}