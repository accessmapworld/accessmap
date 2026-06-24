import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Banknote, ShieldCheck, TrendingUp, ArrowRight, Calculator } from 'lucide-react'
import Layout from '../components/Layout'

const fmtUSD = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${Math.round(n)}`
const fmtNum = (n: number) => n.toLocaleString('en-US')

export default function Councils() {
  const [pop, setPop] = useState(150000)
  const [venues, setVenues] = useState(250)
  const [tourismM, setTourismM] = useState(400) // annual tourism spend, $M
  const [complaints, setComplaints] = useState(120) // monthly accessibility enquiries

  // Transparent, illustrative model — replace coefficients with audited figures pre-pitch.
  const accessibleResidents = Math.round(pop / 6) // 1-in-6 access-need benchmark
  const liabilityExposure = venues * 4200 // modeled annual compliance-risk exposure per venue
  const callReduction = Math.round(complaints * 12 * 0.9) // 90% deflection (Tauranga benchmark)
  const tourismUplift = tourismM * 1_000_000 * 0.12 // accessible-tourism share captured

  return (
    <Layout>
      {/* Hero */}
      <section className="rounded-3xl bg-[#070B18] px-6 py-14 text-center text-white">
        <p className="label text-primary/80">For councils &amp; economic development</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
          Make your city the most accessible in the region.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-white/70">
          Access Dashboards give your council a live, auditable view of accessibility compliance across every public
          venue, business district, and transport node — updated continuously, reported automatically.
        </p>
        <a href="mailto:support@accessmap.app?subject=Council%20demo%20request"
          className="btn-primary mx-auto mt-7 inline-flex px-6 py-3 text-base">Book a council demo <ArrowRight size={18} /></a>
      </section>

      {/* Three budget buckets */}
      <section className="mt-12 grid gap-5 md:grid-cols-3">
        {[
          { icon: TrendingUp, color: '#1e8e3e', title: 'Tourism revenue', body: 'Accessible tourism is a multi-billion-dollar segment. Cities with verified accessible infrastructure capture a disproportionate share of inclusive-travel spend.' },
          { icon: Banknote, color: '#1a73e8', title: 'Grant eligibility', body: 'Audit-ready accessibility documentation is increasingly required for Smart-City and inclusive-infrastructure grant applications.' },
          { icon: ShieldCheck, color: '#ea4335', title: 'Legal-risk reduction', body: 'Proactive, timestamped compliance records reduce municipal liability exposure under ADA / Equality Act / EAA regimes.' },
        ].map((c) => {
          const Icon = c.icon
          return (
            <div key={c.title} className="card p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: c.color }}><Icon size={24} /></span>
              <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{c.body}</p>
            </div>
          )
        })}
      </section>

      {/* ROI calculator */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Calculator size={18} className="text-primary" />
          <h2 className="text-2xl font-semibold">Municipal impact calculator</h2>
        </div>
        <p className="mt-1 text-sm text-muted">Move the inputs to model your council's opportunity. Figures are illustrative.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Inputs */}
          <div className="card space-y-5 p-6">
            {[
              { label: 'City population', val: pop, set: setPop, min: 10000, max: 2000000, step: 10000, fmt: fmtNum },
              { label: 'Public venues to map', val: venues, set: setVenues, min: 20, max: 3000, step: 10, fmt: fmtNum },
              { label: 'Annual tourism spend ($M)', val: tourismM, set: setTourismM, min: 10, max: 5000, step: 10, fmt: (n: number) => `$${fmtNum(n)}M` },
              { label: 'Monthly accessibility enquiries', val: complaints, set: setComplaints, min: 0, max: 1000, step: 5, fmt: fmtNum },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-sm">
                  <span>{f.label}</span>
                  <span className="font-mono text-primary">{f.fmt(f.val)}</span>
                </div>
                <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
                  onChange={(e) => f.set(Number(e.target.value))} className="mt-1 w-full accent-[#1a73e8]" />
              </div>
            ))}
          </div>

          {/* Outputs */}
          <div className="card space-y-4 p-6">
            {[
              { label: 'Residents with an access need', value: fmtNum(accessibleResidents), sub: '1-in-6 global benchmark' },
              { label: 'Modeled annual compliance-risk exposure', value: fmtUSD(liabilityExposure), sub: `${fmtNum(venues)} venues × modeled per-venue risk` },
              { label: 'Annual enquiry calls deflected', value: fmtNum(callReduction), sub: '90% deflection benchmark' },
              { label: 'Accessible-tourism spend in play', value: fmtUSD(tourismUplift), sub: '12% of tourism spend' },
            ].map((o) => (
              <div key={o.label} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm text-muted">{o.label}</p>
                  <p className="label">{o.sub}</p>
                </div>
                <p className="text-2xl font-bold text-primary">{o.value}</p>
              </div>
            ))}
            <a href="mailto:support@accessmap.app?subject=Council%20compliance%20report"
              className="btn-primary mt-2 w-full">Get your full compliance report <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      {/* 30-day sprint */}
      <section className="mt-14">
        <p className="label">Repeatable deployment</p>
        <h2 className="mt-2 text-2xl font-semibold">The 30-day regional mapping sprint</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { wk: 'Week 1', t: 'Anchor institutions', d: 'Council venues, transport hubs, and anchor retail mapped by our onboarding team — the density anchors.' },
            { wk: 'Week 2', t: 'SME incentive cohort', d: 'Chambers of Commerce drive co-branded business adoption with a district coverage leaderboard.' },
            { wk: 'Week 3', t: 'Community cohorts', d: 'Trained volunteers from disability orgs map remaining venues, paths, parks, and transit nodes.' },
            { wk: 'Week 4', t: 'Verify & launch', d: 'AI + auditor verification, branded Access Dashboard goes live, press & launch event.' },
          ].map((s, i) => (
            <div key={s.wk} className="card p-5" style={{ animation: 'pageIn 320ms ease-out both', animationDelay: `${i * 70}ms` }}>
              <p className="label text-primary">{s.wk}</p>
              <h3 className="mt-1 font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-2xl bg-[#070B18] px-6 py-5 text-center text-white/80">
          In 30 days, your city goes from zero digital accessibility infrastructure to a fully auditable, public
          compliance dashboard — ready for government reporting, tourism promotion, and ADA/Equality Act documentation.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
        <Building2 size={18} className="text-muted" />
        <span className="text-muted">Already serving government councils.</span>
        <Link to="/security" className="text-primary">See security &amp; compliance →</Link>
      </div>
    </Layout>
  )
}
