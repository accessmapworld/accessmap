import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Bus, Globe, Users, CheckCircle2, ArrowRight,
  Mail, ShieldCheck, BadgeCheck, TrendingUp, Zap,
} from 'lucide-react'
import Layout from '../components/Layout'

const USE_CASES = [
  { icon: Building2, color: '#1a73e8', title: 'Retail & hospitality', body: 'Prove ADA compliance, attract the $490B disability market, and display your Verified Accessible badge.' },
  { icon: Bus,       color: '#0ABFBF', title: 'Transit & transport',  body: 'Real-time lift and ramp status. Step-free journey planning built into your app.' },
  { icon: Globe,     color: '#7c3aed', title: 'Municipalities',       body: 'ADA Title II + EU Accessibility Act audit data at city scale with remediation tracking.' },
  { icon: Users,     color: '#f97316', title: 'Real estate & venues', body: 'Accessibility ratings across your entire portfolio for compliance reporting and marketing.' },
]

const FEATURES = [
  'AI-verified accessibility scores for every venue',
  'Verified Accessible badge for your website & Google listing',
  'Accessibility audit report (PDF export)',
  'REST API access for your own apps',
  'Bulk venue data ingest (CSV / JSON)',
  'Real-time webhook on data changes',
  'City-scale coverage via OpenStreetMap + AI enrichment',
  'ADA & EU Accessibility Act compliance exports',
]

export default function ForBusiness() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', org: '', useCase: '', message: '' })
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <Layout>
      <main id="main-content">

        {/* Hero */}
        <section aria-labelledby="b2b-hero-heading" className="bg-[#070B18] px-6 py-20 text-center sm:py-28">
          <div className="mx-auto max-w-3xl">
            <p className="label text-[#0ABFBF]/80">For businesses &amp; cities</p>
            <h1 id="b2b-hero-heading" className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Accessibility intelligence<br />at scale. Free.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/65 leading-relaxed">
              AccessMap is free for everyone — individuals, businesses, and cities.
              Get AI-verified accessibility data, a Verified Accessible badge, and API access at no cost.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-[#1a73e8] px-7 py-3 text-base font-semibold text-white hover:bg-[#1557b0] transition-colors shadow-lg shadow-[#1a73e8]/30">
                Get started free <ArrowRight size={18} aria-hidden="true" />
              </a>
              <Link to="/map" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-7 py-3 text-base font-semibold text-white hover:bg-white/15 transition-colors backdrop-blur">
                Explore the map
              </Link>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section aria-labelledby="use-cases-heading" className="mx-auto max-w-5xl px-6 py-16">
          <h2 id="use-cases-heading" className="text-2xl font-semibold text-ink text-center">Who we work with</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map(({ icon: Icon, color, title, body }) => (
              <div key={title} className="card p-5">
                <Icon size={22} style={{ color }} aria-hidden="true" className="mb-3" />
                <p className="font-semibold text-ink text-sm">{title}</p>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <div className="border-y border-border bg-[#f8f9fa] px-6 py-8">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4 text-center">
            {[
              { n: '1.3B', label: 'people with disabilities (WHO)', icon: Users, color: '#1a73e8' },
              { n: '$490B', label: 'US disability spending power', icon: TrendingUp, color: '#0ABFBF' },
              { n: '↑67%', label: 'ADA lawsuits over 5 years', icon: ShieldCheck, color: '#ea4335' },
              { n: '50M+', label: 'venues in AccessMap database', icon: Globe, color: '#7c3aed' },
            ].map(({ n, label, icon: Icon, color }) => (
              <div key={n}>
                <Icon size={18} className="mx-auto mb-2" style={{ color }} aria-hidden="true" />
                <p className="text-2xl font-bold text-ink">{n}</p>
                <p className="mt-0.5 text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What's included */}
        <section aria-labelledby="features-heading" className="mx-auto max-w-4xl px-6 py-16">
          <div className="flex items-center gap-3 mb-6">
            <Zap size={22} className="text-primary" aria-hidden="true" />
            <h2 id="features-heading" className="text-2xl font-semibold text-ink">Everything included, free</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map(f => (
              <div key={f} className="flex items-start gap-3 rounded-xl border border-border bg-white p-4">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#1e8e3e]" aria-hidden="true" />
                <span className="text-sm text-ink">{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-[#e6f4ea] border border-[#a8d5b5] px-4 py-3">
            <BadgeCheck size={16} className="text-[#1e8e3e] shrink-0" aria-hidden="true" />
            <p className="text-sm text-[#1a7337]"><strong>Always free.</strong> No credit card. No usage limits for standard access. No hidden fees.</p>
          </div>
        </section>

        {/* Contact form */}
        <section id="contact" aria-labelledby="contact-heading" className="mx-auto max-w-2xl px-6 py-16">
          <h2 id="contact-heading" className="text-2xl font-semibold text-ink text-center">Get in touch</h2>
          <p className="mt-2 text-muted text-center text-sm">
            Tell us about your use case and we'll set you up with everything you need.
          </p>

          {submitted ? (
            <div role="alert" className="mt-8 rounded-2xl bg-[#e6f4ea] border border-[#a8d5b5] p-8 text-center">
              <CheckCircle2 size={32} className="mx-auto text-[#1e8e3e] mb-3" aria-hidden="true" />
              <p className="font-semibold text-[#1e8e3e] text-lg">Request received!</p>
              <p className="mt-2 text-sm text-[#2d6a4f]">We'll be in touch at <strong>{form.email}</strong> within 1 business day.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-ink mb-1">Full name <span aria-hidden="true">*</span></label>
                  <input id="name" name="name" type="text" required value={form.name} onChange={handleChange}
                    className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Jane Smith" autoComplete="name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">Email <span aria-hidden="true">*</span></label>
                  <input id="email" name="email" type="email" required value={form.email} onChange={handleChange}
                    className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="jane@company.com" autoComplete="email" />
                </div>
              </div>
              <div>
                <label htmlFor="org" className="block text-sm font-medium text-ink mb-1">Organisation <span aria-hidden="true">*</span></label>
                <input id="org" name="org" type="text" required value={form.org} onChange={handleChange}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Acme Corp / City of Austin" autoComplete="organization" />
              </div>
              <div>
                <label htmlFor="useCase" className="block text-sm font-medium text-ink mb-1">Primary use case</label>
                <select id="useCase" name="useCase" value={form.useCase} onChange={handleChange}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                  <option value="">Select one…</option>
                  <option value="retail">Retail / Hospitality</option>
                  <option value="transit">Transit / Transport</option>
                  <option value="municipality">Municipality / Government</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="api">API / Data licensing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-ink mb-1">Tell us more</label>
                <textarea id="message" name="message" rows={4} value={form.message} onChange={handleChange}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Number of locations, specific compliance requirements, timeline…" />
              </div>
              <button type="submit" disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1a73e8] py-3 text-base font-semibold text-white hover:bg-[#1557b0] transition-colors disabled:opacity-60"
                aria-busy={loading}>
                {loading ? 'Sending…' : 'Get started free'}
              </button>
              <p className="text-xs text-muted text-center">
                Or email us: <a href="mailto:business@accessmap.world" className="text-primary underline hover:no-underline inline-flex items-center gap-1">
                  <Mail size={11} aria-hidden="true" /> business@accessmap.world
                </a>
              </p>
            </form>
          )}
        </section>

        <div className="border-t border-border py-8 text-center text-sm text-muted">
          <Link to="/" className="hover:underline">← Back to AccessMap</Link>
          <span className="mx-3" aria-hidden="true">·</span>
          <Link to="/accessibility" className="hover:underline">Accessibility Statement</Link>
          <span className="mx-3" aria-hidden="true">·</span>
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        </div>
      </main>
    </Layout>
  )
}
