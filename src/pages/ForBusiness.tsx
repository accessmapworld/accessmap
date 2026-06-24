import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Bus, Globe, Users, CheckCircle2, ArrowRight,
  Mail, Phone, ShieldCheck, BadgeCheck, TrendingUp, Zap,
} from 'lucide-react'
import Layout from '../components/Layout'

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    desc: 'Perfect for individual venues or small organisations.',
    features: [
      'AccessMap listing for 1 venue',
      'Basic accessibility score display',
      'Community review widget',
      'Manual data corrections',
    ],
    cta: 'Get listed',
    href: '/map',
    primary: false,
  },
  {
    name: 'Business',
    price: '$199/mo',
    desc: 'For multi-location businesses and hospitality groups.',
    features: [
      'Up to 50 venues',
      'AI-verified accessibility scores',
      'Verified Accessible badge',
      'Accessibility audit report (PDF)',
      'API read access (10k req/mo)',
      'Priority support',
    ],
    cta: 'Request access',
    href: '#contact',
    primary: true,
  },
  {
    name: 'Enterprise / Gov',
    price: 'Custom',
    desc: 'For cities, transit authorities, and large enterprises.',
    features: [
      'Unlimited venues',
      'Full API access (bulk ingest + query)',
      'White-label data licensing',
      'ADA / EU Accessibility Act audit exports',
      'Dedicated CSM + SLA',
      'On-premise data option',
    ],
    cta: 'Book a demo',
    href: '#contact',
    primary: false,
  },
]

const USE_CASES = [
  {
    icon: Building2, color: '#1a73e8',
    title: 'Retail & hospitality',
    body: 'Prove WCAG and ADA compliance, attract the $490B disability market, and display your Verified Accessible badge on Google, Yelp, and your own site.',
  },
  {
    icon: Bus, color: '#0ABFBF',
    title: 'Transit & transport',
    body: 'Publish real-time elevator and ramp status. Surface step-free journey planning for 1-click accessible routing in your app.',
  },
  {
    icon: Globe, color: '#7c3aed',
    title: 'Municipalities',
    body: 'ADA Title II + EU Accessibility Act compliance requires city-scale audit data. AccessMap provides city-wide coverage and remediation dashboards.',
  },
  {
    icon: Users, color: '#f97316',
    title: 'Real estate & venues',
    body: 'Accessibility ratings for every property in your portfolio — useful for due diligence, compliance reporting, and tenant marketing.',
  },
]

const API_FEATURES = [
  'REST + GraphQL endpoints',
  'Bulk venue ingest (CSV / JSON)',
  'Webhook on data change',
  'OAuth 2.0 authentication',
  'Rate-limit: 10k–unlimited req/mo',
  'Sandbox environment',
  'OpenAPI 3.1 spec + SDKs',
  'SLA: 99.9% uptime (Enterprise)',
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
    // Simulate submission (replace with real endpoint later)
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
              Accessibility intelligence<br />at enterprise scale.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/65 leading-relaxed">
              License AccessMap's AI-verified accessibility data. Get a Verified Accessible badge.
              Meet ADA Title II and EU Accessibility Act obligations — before the lawsuit arrives.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#contact" className="btn-primary px-7 py-3 text-base font-semibold">
                Request data access <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a href="#plans" className="btn bg-white/10 border border-white/20 px-7 py-3 text-base font-semibold text-white hover:bg-white/20 backdrop-blur">
                View plans
              </a>
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

        {/* Stats bar */}
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

        {/* Plans */}
        <section id="plans" aria-labelledby="plans-heading" className="mx-auto max-w-5xl px-6 py-16">
          <h2 id="plans-heading" className="text-2xl font-semibold text-ink text-center">Plans</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {PLANS.map(({ name, price, desc, features, cta, href, primary }) => (
              <div key={name} className={`card flex flex-col p-6 ${primary ? 'ring-2 ring-primary' : ''}`}>
                {primary && (
                  <span className="mb-3 self-start rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">Most popular</span>
                )}
                <p className="font-semibold text-ink">{name}</p>
                <p className="mt-1 text-3xl font-bold text-ink">{price}</p>
                <p className="mt-2 text-sm text-muted">{desc}</p>
                <ul className="mt-4 space-y-2 flex-1" role="list">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#1e8e3e]" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={href} className={`mt-6 btn text-sm font-semibold text-center ${primary ? 'btn-primary' : 'btn-ghost'}`}>
                  {cta}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* API features */}
        <section aria-labelledby="api-heading" className="bg-[#f8f9fa] px-6 py-14">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Zap size={22} className="text-primary" aria-hidden="true" />
              <h2 id="api-heading" className="text-2xl font-semibold text-ink">API &amp; data access</h2>
            </div>
            <p className="text-muted leading-relaxed max-w-2xl">
              Integrate AccessMap's accessibility data directly into your product, app, or ADA compliance workflow.
              REST and GraphQL with bulk ingest, webhooks, and a full OpenAPI spec.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {API_FEATURES.map(f => (
                <div key={f} className="flex items-start gap-2 text-sm text-muted">
                  <BadgeCheck size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact form */}
        <section id="contact" aria-labelledby="contact-heading" className="mx-auto max-w-2xl px-6 py-16">
          <h2 id="contact-heading" className="text-2xl font-semibold text-ink text-center">Get in touch</h2>
          <p className="mt-2 text-muted text-center">
            Tell us about your use case. We'll follow up within 1 business day.
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
                  <input
                    id="name" name="name" type="text" required
                    value={form.name} onChange={handleChange}
                    className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Jane Smith"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">Work email <span aria-hidden="true">*</span></label>
                  <input
                    id="email" name="email" type="email" required
                    value={form.email} onChange={handleChange}
                    className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="jane@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="org" className="block text-sm font-medium text-ink mb-1">Organisation <span aria-hidden="true">*</span></label>
                <input
                  id="org" name="org" type="text" required
                  value={form.org} onChange={handleChange}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Acme Corp / City of Austin"
                  autoComplete="organization"
                />
              </div>
              <div>
                <label htmlFor="useCase" className="block text-sm font-medium text-ink mb-1">Primary use case</label>
                <select
                  id="useCase" name="useCase"
                  value={form.useCase} onChange={handleChange}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
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
                <textarea
                  id="message" name="message" rows={4}
                  value={form.message} onChange={handleChange}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Number of locations, specific compliance requirements, timeline…"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-60"
                aria-busy={loading}
              >
                {loading ? 'Sending…' : 'Request data access'}
              </button>
              <p className="text-xs text-muted text-center">
                Or email us directly:{' '}
                <a href="mailto:business@accessmap.world" className="text-primary underline hover:no-underline inline-flex items-center gap-1">
                  <Mail size={11} aria-hidden="true" /> business@accessmap.world
                </a>
              </p>
            </form>
          )}
        </section>

        {/* Footer nav */}
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
