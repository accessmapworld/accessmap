import { Link } from 'react-router-dom'
import { ShieldCheck, Lock, FileCheck, Code2, Activity, Download, Landmark, CalendarClock } from 'lucide-react'
import Layout from '../components/Layout'

type Status = 'live' | 'progress' | 'planned'
const badge = (s: Status) =>
  s === 'live' ? { t: 'Available', c: 'bg-green-600' } : s === 'progress' ? { t: 'In progress', c: 'bg-[#f29900]' } : { t: 'On roadmap', c: 'bg-muted' }

const CARDS: { icon: typeof Lock; title: string; status: Status; body: string }[] = [
  { icon: Lock, title: 'SOC 2 Type II', status: 'progress', body: 'Controls implementation underway with a target Type II report; observation window scheduled. Status and auditor available under NDA.' },
  { icon: FileCheck, title: 'GDPR / CCPA', status: 'live', body: 'Data Processing Agreement available, configurable data residency (EU / US / AU / NZ), right-to-erasure, and a documented retention policy.' },
  { icon: ShieldCheck, title: 'WCAG 2.2 AAA', status: 'live', body: 'This product is built to the WCAG 2.2 standard. Conformance report (VPAT-style), testing methodology, and remediation log available on request.' },
  { icon: Code2, title: 'API & integrations', status: 'progress', body: 'REST API for venue + accessibility data: token auth, rate limits, sandbox, and webhooks. Reference docs issued to enterprise partners.' },
  { icon: Activity, title: 'Uptime & SLA', status: 'live', body: 'Hosted on globally-distributed edge infrastructure with a public status page and enterprise SLA commitments on the Dashboards tier.' },
  { icon: Download, title: 'Data export & portability', status: 'live', body: 'Export your data any time in JSON / CSV. Clear repatriation process on exit — your accessibility data is yours.' },
]

const TIMELINE: { date: string; law: string; impact: string; product: string }[] = [
  { date: 'In force — Jun 2025', law: 'European Accessibility Act (EAA)', impact: 'Businesses serving EU customers must meet accessibility requirements.', product: 'Access Pages + Dashboards documentation' },
  { date: 'Active enforcement', law: 'UK Equality Act 2010', impact: 'Rising litigation drives proactive compliance demand.', product: 'Access Overviews (audit records)' },
  { date: '10,000+ suits / year', law: 'US ADA Title III', impact: 'Documented accessibility increasingly cited as liability mitigation.', product: 'Verification-tier audit trail' },
  { date: 'Signatory obligations', law: 'UN CRPD', impact: 'Municipal procurement pressure across NZ / UK / EU / US.', product: 'Government Access Dashboards' },
]

export default function Security() {
  return (
    <Layout>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck size={24} /></span>
        <div>
          <h1 className="text-3xl font-semibold">Security &amp; Compliance</h1>
          <p className="text-muted">What enterprise and government IT teams need before a sales conversation.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => {
          const Icon = c.icon; const b = badge(c.status)
          return (
            <div key={c.title} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg text-primary"><Icon size={20} /></span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white ${b.c}`}>{b.t}</span>
              </div>
              <h3 className="mt-3 font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{c.body}</p>
            </div>
          )
        })}
      </div>

      {/* Regulatory timeline */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <CalendarClock size={18} className="text-primary" />
          <h2 className="text-2xl font-semibold">Regulatory timeline</h2>
        </div>
        <p className="mt-1 text-sm text-muted">The compliance deadlines that create inescapable demand — and the product that satisfies each.</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="label text-left">
                <th className="py-2 pr-4">When</th><th className="pr-4">Regulation</th><th className="pr-4">Impact</th><th>Satisfied by</th>
              </tr>
            </thead>
            <tbody>
              {TIMELINE.map((r) => (
                <tr key={r.law} className="border-t border-border align-top">
                  <td className="py-3 pr-4 font-mono text-xs text-alert">{r.date}</td>
                  <td className="py-3 pr-4 font-medium">{r.law}</td>
                  <td className="py-3 pr-4 text-muted">{r.impact}</td>
                  <td className="py-3 text-primary">{r.product}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Government purchasing */}
      <section className="mt-12 rounded-3xl bg-[#070B18] p-7 text-white">
        <div className="flex items-center gap-3">
          <Landmark size={22} className="text-primary" />
          <h2 className="text-2xl font-semibold">Government purchasing</h2>
        </div>
        <p className="mt-2 max-w-2xl text-white/70">
          We support procurement through panel arrangements, purchase orders, invoice billing, and direct negotiation.
          RFP-response templates, data-governance documentation, and reference contacts are available to qualified
          public-sector buyers.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="mailto:support@accessmap.app?subject=Procurement%20%2F%20RFP" className="btn-primary">Request procurement pack</a>
          <Link to="/councils" className="btn bg-white text-[#070B18] hover:shadow-lg">For councils →</Link>
        </div>
      </section>

      <p className="mt-8 text-xs text-muted">
        Statuses reflect current roadmap. Replace with your real audit dates, auditor, and report links before launch.
      </p>
    </Layout>
  )
}
