import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, ArrowRight, Star, ShieldCheck, Ear, Eye,
  CheckCircle2, Users, Zap, Camera, Cpu, Building2, Bus,
  TrendingUp, Scale, Globe, BadgeCheck, Route as RouteIcon,
  Accessibility, Heart, Lock, ChevronRight,
} from 'lucide-react'
import Layout from '../components/Layout'
import Aurora from '../components/reactbits/Aurora'
import GradientText from '../components/reactbits/GradientText'
import ShinyText from '../components/reactbits/ShinyText'

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '', duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        setVal(Math.round(ease * to))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  'Ramp gradient & width', 'Handrail presence', 'Step count & height',
  'Kerb type (flush / lowered)', 'Door width & type (auto/manual)',
  'Lift dimensions (W × D)', 'Accessible WC with grab rails',
  'WC turning space (min. 150cm)', 'Disabled parking spaces',
  'Hearing loop availability', 'Braille & tactile signage',
  'Quiet / sensory rooms', 'Changing Place facilities',
  'Assistance dog welcome', 'Wheelchair seating count',
]

const HOW_STEPS = [
  {
    n: '01', icon: Camera, color: '#0ABFBF',
    title: 'Community snaps a photo',
    body: 'Any visitor can photograph a ramp, entrance, or restroom. No training needed.',
  },
  {
    n: '02', icon: Cpu, color: '#1a73e8',
    title: 'AI reads the scene',
    body: 'Computer-vision models detect barriers, measure door widths, count steps — instantly and consistently at global scale.',
    badge: 'AI moat',
  },
  {
    n: '03', icon: RouteIcon, color: '#7c3aed',
    title: 'Trusted score + step-free route',
    body: 'Verified scores publish in seconds. Users get reliable ratings and turn-by-turn step-free navigation before they arrive.',
  },
]

const B2B = [
  { icon: Building2, color: '#1a73e8', label: 'Retail & hospitality', body: 'Prove ADA compliance. Attract the $490B disability market.' },
  { icon: Bus,       color: '#0ABFBF', label: 'Transit authorities',   body: 'Real-time lift/ramp status. Accessible journey planning.' },
  { icon: Globe,     color: '#7c3aed', label: 'Municipalities',        body: 'City-scale audit data + remediation tracking.' },
  { icon: Users,     color: '#f97316', label: 'Real estate',           body: 'Accessibility ratings across your entire portfolio.' },
]

const TESTIMONIALS = [
  { quote: "Finally a map that tells me the ramp width AND whether the lift is working — before I leave home.", name: 'Sarah K.', role: 'Manual wheelchair user', initials: 'SK', color: '#0ABFBF' },
  { quote: "AccessMap is the only tool that shows me which venues have hearing loops. Game-changer.", name: 'David M.', role: 'Hard of hearing', initials: 'DM', color: '#1a73e8' },
  { quote: "As a carer I spent hours ringing ahead. Now I see door widths, WC, and parking in seconds.", name: 'Priya T.', role: 'Accessibility advocate', initials: 'PT', color: '#7c3aed' },
]

const WHY_NOW = [
  { stat: 1.3, suffix: 'B', label: 'people globally with a disability', src: 'WHO 2023' },
  { stat: 490, suffix: 'B', label: 'US disability consumer spending', src: 'Accenture 2023' },
  { stat: 67, suffix: '%', label: 'rise in ADA lawsuits over 5 years', src: 'Seyfarth 2024' },
  { stat: 50, suffix: 'M+', label: 'venues in the AccessMap database', src: 'OpenStreetMap' },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <Layout bare>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section aria-labelledby="hero-heading" className="relative mx-3 mt-3 overflow-hidden rounded-3xl bg-[#070B18] px-6 py-24 text-center sm:py-36">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Aurora colorStops={['#0ABFBF', '#1a73e8', '#7C3AED']} amplitude={1.2} blend={0.5} />
        </div>

        {/* Floating badge */}
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-sm text-white/75 backdrop-blur-sm mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0ABFBF] animate-pulse" aria-hidden="true" />
            <ShinyText text="AI-powered accessibility intelligence" color="#c7ccd6" shineColor="#0ABFBF" speed={3} />
          </div>

          <h1 id="hero-heading" className="font-semibold tracking-tight text-white">
            <span className="block text-5xl sm:text-7xl leading-[1.05]">The physical world,</span>
            <span className="block text-5xl sm:text-7xl leading-[1.05] mt-2">
              <GradientText colors={['#0ABFBF', '#7df9ff', '#1a73e8', '#0ABFBF']} animationSpeed={5}>
                mapped for everyone.
              </GradientText>
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-xl text-white/60 leading-relaxed">
            AccessMap uses AI and community data to map ramps, step-free entrances, accessible restrooms,
            and step-free routes — at a scale no human team can match.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/map" className="group inline-flex items-center gap-2 rounded-full bg-[#1a73e8] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#1a73e8]/30 hover:bg-[#1557b0] transition-all">
              Explore the map
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
            <Link to="/for-business" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-8 py-3.5 text-base font-semibold text-white backdrop-blur hover:bg-white/15 transition-all">
              For businesses
            </Link>
          </div>

          {/* Score preview cards */}
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Example accessibility scores">
            {[
              { icon: Accessibility, color: '#0ABFBF', label: 'Mobility',  score: '9.1' },
              { icon: Ear,           color: '#1a73e8', label: 'Hearing',   score: '8.5' },
              { icon: Eye,           color: '#7c3aed', label: 'Vision',    score: '7.8' },
              { icon: Heart,         color: '#f97316', label: 'Sensory',   score: '8.2' },
            ].map(({ icon: Icon, color, label, score }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm text-center">
                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full border-2" style={{ borderColor: color }}>
                  <span className="text-base font-bold text-white">{score}</span>
                </div>
                <Icon size={13} className="mx-auto mb-1" style={{ color }} aria-hidden="true" />
                <p className="text-[11px] text-white/45">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/25">Example — Royal Festival Hall, London · AI-verified</p>

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-white/35">
            <span className="flex items-center gap-1.5"><Lock size={11} aria-hidden="true" /> No credit card · Free forever</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={11} aria-hidden="true" /> WCAG 2.2 AA target</span>
            <span className="flex items-center gap-1.5"><BadgeCheck size={11} aria-hidden="true" /> OpenStreetMap + Wikidata</span>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section aria-label="Key statistics" className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          {WHY_NOW.map(({ stat, suffix, label, src }) => (
            <div key={label} className="px-8 py-10 text-center">
              <p className="text-4xl font-bold text-ink tabular-nums">
                <Counter to={stat} suffix={suffix} />
              </p>
              <p className="mt-1.5 text-sm text-muted leading-snug">{label}</p>
              <p className="mt-1 text-[10px] text-muted/50">{src}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE PROBLEM ───────────────────────────────────────────────────── */}
      <section aria-labelledby="problem-heading" className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="label">The problem</p>
            <h2 id="problem-heading" className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              The physical world is a black box for 1.3 billion people.
            </h2>
            <p className="mt-5 text-lg text-muted leading-relaxed">
              Existing maps are sparse, manual, and hopelessly slow. A venue with 200 Google reviews
              still has zero information on ramp width, door clearance, or whether the accessible
              restroom is actually accessible.
            </p>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              <strong className="text-ink">AccessMap fixes this with AI</strong> — extracting precise
              measurements from community photos at a scale no volunteer network can match.
            </p>
            <Link to="/map" className="mt-7 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
              See it live <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              { emoji: '🗺️', title: 'Sparse', desc: 'Google Maps averages 1 accessibility tag per venue worldwide.' },
              { emoji: '🐢', title: 'Manual & slow', desc: 'Human volunteers cannot keep pace with the physical world changing daily.' },
              { emoji: '⚠️', title: 'Dangerously stale', desc: 'Lifts reported working are out of service. Ramps have been removed. No one knows.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="flex items-start gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
                <span className="text-2xl" role="img" aria-hidden="true">{emoji}</span>
                <div>
                  <p className="font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section aria-labelledby="how-heading" className="px-3 pb-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#070B18] px-6 py-16 sm:px-12">
          <div className="text-center mb-12">
            <p className="label text-[#0ABFBF]/70">How it works</p>
            <h2 id="how-heading" className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Community data. AI precision. Instant results.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {HOW_STEPS.map(({ n, icon: Icon, color, title, body, badge }) => (
              <div key={n} className={`relative rounded-2xl p-6 ${badge ? 'border-2 border-[#1a73e8]/50 bg-[#1a73e8]/10' : 'border border-white/10 bg-white/5'}`}>
                {badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#1a73e8]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#93c5fd]">{badge}</span>
                )}
                <div className="flex items-center gap-3 mb-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: color }} aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <span className="font-mono text-xs font-bold" style={{ color }}>{n}</span>
                </div>
                <p className="font-semibold text-white leading-snug mb-2">{title}</p>
                <p className="text-sm text-white/55 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* Feature grid */}
          <div className="mt-10 rounded-2xl border border-white/8 bg-white/4 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40 text-center">Every detail we capture</p>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 sm:grid-cols-3 lg:grid-cols-5">
              {FEATURES.map(f => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-white/55">
                  <CheckCircle2 size={10} className="shrink-0 text-[#0ABFBF]" aria-hidden="true" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/map" className="inline-flex items-center gap-2 rounded-full bg-[#1a73e8] px-8 py-3.5 text-base font-semibold text-white hover:bg-[#1557b0] transition-colors shadow-lg shadow-[#1a73e8]/30">
              Try AccessMap free <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOR BUSINESS ──────────────────────────────────────────────────── */}
      <section aria-labelledby="b2b-heading" className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl border border-border bg-white p-8 sm:p-12 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="label">For businesses &amp; cities</p>
              <h2 id="b2b-heading" className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                Prove your accessibility.<br />Cut legal risk.
              </h2>
              <p className="mt-4 text-lg text-muted leading-relaxed">
                ADA litigation is up 67% in 5 years. The EU Accessibility Act is now in force.
                AccessMap gives you the data to prove compliance and earn the trust of 1.3 billion customers.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/for-business" className="inline-flex items-center gap-2 rounded-full bg-[#1a73e8] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1557b0] transition-colors">
                  Request data access <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link to="/councils" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-ink hover:bg-[#f8f9fa] transition-colors">
                  For municipalities
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted">
                <span className="flex items-center gap-1.5"><Scale size={13} className="text-[#1a73e8]" aria-hidden="true" /> ADA Title II compliance</span>
                <span className="flex items-center gap-1.5"><TrendingUp size={13} className="text-[#0ABFBF]" aria-hidden="true" /> EU Accessibility Act</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#7c3aed]" aria-hidden="true" /> Verified Accessible badge</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {B2B.map(({ icon: Icon, color, label, body }) => (
                <div key={label} className="rounded-2xl border border-border bg-[#f8f9fa] p-4">
                  <Icon size={18} style={{ color }} aria-hidden="true" className="mb-2.5" />
                  <p className="font-semibold text-ink text-sm">{label}</p>
                  <p className="mt-1 text-xs text-muted leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section aria-labelledby="testimonials-heading" className="bg-[#f8f9fa] border-y border-border px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 id="testimonials-heading" className="text-2xl font-semibold text-ink text-center mb-8">
            Real people. Real difference.
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role, initials, color }) => (
              <figure key={name} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="flex gap-0.5" aria-label="5 stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-[#f59e0b] text-[#f59e0b]" aria-hidden="true" />)}
                </div>
                <blockquote className="text-sm text-ink leading-relaxed flex-1">"{quote}"</blockquote>
                <figcaption className="flex items-center gap-3 pt-2 border-t border-border">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: color }} aria-hidden="true">{initials}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{name}</p>
                    <p className="text-xs text-muted">{role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY NOW ───────────────────────────────────────────────────────── */}
      <section aria-labelledby="why-heading" className="px-3 py-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#070B18] px-6 py-16 sm:px-12">
          <div className="text-center mb-10">
            <p className="label text-[#0ABFBF]/70">Why now</p>
            <h2 id="why-heading" className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Regulation + market are converging.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/55 leading-relaxed">
              This isn't charity — it's a $490B market. Legal pressure and demographic shift are creating urgent demand for accessibility data infrastructure.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { n: '↑67%', label: 'ADA accessibility lawsuits (5yr)', color: '#ea4335' },
              { n: 'Jun 2025', label: 'EU Accessibility Act in force', color: '#0ABFBF' },
              { n: '10,000+', label: 'new disabled people daily (US)', color: '#f97316' },
              { n: '$490B', label: 'US disability spending power', color: '#1a73e8' },
            ].map(({ n, label, color }) => (
              <div key={n} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <p className="text-2xl font-bold" style={{ color }}>{n}</p>
                <p className="mt-2 text-xs text-white/50 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section aria-labelledby="cta-heading" className="px-3 pb-16">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#070B18] px-6 py-20 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
            <Aurora colorStops={['#1a73e8', '#0ABFBF', '#1a73e8']} amplitude={0.8} blend={0.5} />
          </div>
          <div className="relative z-10">
            <Zap className="mx-auto mb-4 text-[#0ABFBF]" size={36} aria-hidden="true" />
            <h2 id="cta-heading" className="text-3xl font-semibold text-white sm:text-5xl leading-tight">
              Build the world's<br />accessibility layer with us.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-white/55 leading-relaxed text-lg">
              Every photo, review, and correction you add feeds the AI and helps someone get where they need to go.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link to="/map" className="group inline-flex items-center gap-2 rounded-full bg-[#1a73e8] px-9 py-4 text-lg font-semibold text-white shadow-xl shadow-[#1a73e8]/30 hover:bg-[#1557b0] transition-all">
                Explore the map
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <Link to="/for-business" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-9 py-4 text-lg font-semibold text-white backdrop-blur hover:bg-white/15 transition-all">
                Partner with us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-white py-14 text-center text-sm text-muted" role="contentinfo">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin size={16} className="text-primary" aria-hidden="true" />
            <span className="text-base font-bold text-ink">Access<span className="text-primary">Map</span></span>
          </div>
          <p className="text-sm text-muted">AI-powered accessibility intelligence · Built for 1.3B people</p>

          <nav aria-label="Footer navigation" className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link to="/map" className="hover:text-ink hover:underline">Map</Link>
            <Link to="/route" className="hover:text-ink hover:underline">Route planner</Link>
            <Link to="/for-business" className="hover:text-ink hover:underline">For Business</Link>
            <Link to="/councils" className="hover:text-ink hover:underline">For Councils</Link>
            <Link to="/accessibility" className="font-medium text-primary hover:underline">Accessibility Statement</Link>
            <Link to="/report" className="hover:text-ink hover:underline">Report an issue</Link>
            <Link to="/privacy" className="hover:text-ink hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:text-ink hover:underline">Terms</Link>
          </nav>

          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted">
            <span>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors</span>
            <span>Tiles © <a href="https://carto.com/attributions" target="_blank" rel="noreferrer" className="underline">CARTO</a></span>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-muted/60">
            <span className="flex items-center gap-1.5"><BadgeCheck size={12} className="text-[#1e8e3e]" aria-hidden="true" /> WCAG 2.2 AA target</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-primary" aria-hidden="true" /> AI-verified data</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#0ABFBF]" aria-hidden="true" /> Free for everyone</span>
          </div>

          <p className="mt-6 text-xs text-muted/40">
            © {new Date().getFullYear()} AccessMap · Accessibility data is community-sourced and AI-assisted. Do not rely solely on AccessMap for safety-critical decisions.
          </p>
        </div>
      </footer>
    </Layout>
  )
}
