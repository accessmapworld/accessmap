import { Link } from 'react-router-dom'
import {
  MapPin, Accessibility, AlertTriangle, Route as RouteIcon,
  ArrowRight, Star, ShieldCheck, Ear, Eye, Brain,
  CheckCircle2, Users, Zap, Camera, Cpu, Building2, Bus,
  TrendingUp, Scale, Globe, BadgeCheck,
} from 'lucide-react'
import Layout from '../components/Layout'
import Aurora from '../components/reactbits/Aurora'
import GradientText from '../components/reactbits/GradientText'
import ShinyText from '../components/reactbits/ShinyText'

// ─── Static data ──────────────────────────────────────────────────────────────

const AI_STEPS = [
  {
    icon: Camera, color: '#0ABFBF', n: '01',
    title: 'Anyone contributes a photo',
    body: 'A visitor snaps the entrance, ramp, or restroom of any venue — no training required.',
  },
  {
    icon: Cpu, color: '#1a73e8', n: '02',
    title: 'AI extracts the details',
    body: 'Our computer-vision models detect ramps, step counts, door widths, and barriers automatically — consistent, fast, and scalable to millions of venues.',
  },
  {
    icon: RouteIcon, color: '#7c3aed', n: '03',
    title: 'Trusted ratings + step-free routing',
    body: 'Scores are published instantly. Users get reliable accessibility ratings and turn-by-turn step-free routes — before they arrive.',
  },
]

const B2B_BUYERS = [
  { icon: Building2, label: 'Retail & hospitality', body: 'Prove compliance, attract the $490B disability market.' },
  { icon: Bus, label: 'Transit & transport', body: 'Real-time elevator and ramp status; accessible journey planning.' },
  { icon: Globe, label: 'Municipalities', body: 'ADA Title II audit data + remediation tracking at city scale.' },
  { icon: Users, label: 'Real estate & venues', body: 'Accessibility rating for every property in your portfolio.' },
]

const WHY_NOW = [
  { stat: '1.3B', desc: 'people globally live with a disability (WHO)', src: 'WHO, 2023' },
  { stat: '$490B', desc: 'annual US disability consumer spending power', src: 'Accenture, 2023' },
  { stat: '↑67%', desc: 'rise in ADA accessibility lawsuits over 5 years', src: 'Seyfarth, 2024' },
  { stat: 'Jun 2025', desc: 'EU Accessibility Act compliance deadline passed', src: 'European Commission' },
]

const DETAIL_CHECKLIST = [
  'Ramp gradient & width', 'Handrail presence', 'Step count & height',
  'Kerb type (flush / lowered)', 'Door width & type (auto / manual)',
  'Lift dimensions (W × D)', 'Accessible WC with grab rails',
  'WC turning space', 'Disabled parking spaces',
  'Hearing loop availability', 'Braille menus',
  'Quiet / sensory rooms', 'Changing Place facilities',
  'Assistance dog welcome', 'Wheelchair seating count',
]

const TESTIMONIALS = [
  {
    quote: 'Finally a map that tells me if there\'s actually a ramp, how wide it is, and whether the lift is working.',
    name: 'Sarah K.', role: 'Manual wheelchair user', initials: 'SK', color: '#0ABFBF',
  },
  {
    quote: 'AccessMap is the only tool that shows me which venues have hearing loops before I arrive.',
    name: 'David M.', role: 'Hard of hearing', initials: 'DM', color: '#1a73e8',
  },
  {
    quote: 'As a carer I used to spend hours ringing ahead. Now I see door widths, accessible WC, parking in seconds.',
    name: 'Priya T.', role: 'Accessibility advocate', initials: 'PT', color: '#7c3aed',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <Layout bare>

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="relative mx-3 mt-3 overflow-hidden rounded-3xl bg-[#070B18] px-6 py-20 text-center sm:py-28"
      >
        <div className="pointer-events-none absolute inset-0 opacity-75" aria-hidden="true">
          <Aurora colorStops={['#0ABFBF', '#1a73e8', '#7C3AED']} amplitude={1.1} blend={0.55} />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
            <Zap size={14} className="text-[#0ABFBF]" aria-hidden="true" />
            <ShinyText text="AI-powered accessibility intelligence" color="#c7ccd6" shineColor="#0ABFBF" speed={3} />
          </span>

          <h1 id="hero-heading" className="mt-6 font-semibold leading-[1.08] tracking-tight text-white">
            <span className="block text-4xl sm:text-6xl">The physical world,</span>
            <span className="mt-1 block text-4xl sm:text-6xl">
              <GradientText colors={['#0ABFBF', '#7df9ff', '#1a73e8', '#0ABFBF']} animationSpeed={6}>
                mapped for everyone.
              </GradientText>
            </span>
            <span className="mt-1 block text-4xl sm:text-6xl">Verified by AI.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-white/70 leading-relaxed">
            AccessMap combines community reports with computer vision to map ramps, step-free
            entrances, accessible restrooms, and routes — at a scale manual mapping can't reach.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/map" className="btn-primary px-7 py-3 text-base font-semibold">
              Explore the map <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/for-business" className="btn bg-white/10 border border-white/20 px-7 py-3 text-base font-semibold text-white hover:bg-white/20 backdrop-blur">
              For businesses &amp; cities
            </Link>
          </div>

          {/* Mini score card — proof the product is real */}
          <div className="mx-auto mt-12 max-w-xs rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm" aria-label="Example accessibility score card for Royal Festival Hall">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" aria-hidden="true" />
              <p className="text-xs font-medium text-white/50">Example — Royal Festival Hall, London</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Accessibility, color: '#0ABFBF', label: 'Mobility', score: 9.1 },
                { icon: Ear,           color: '#1a73e8', label: 'Hearing',  score: 8.5 },
                { icon: Eye,           color: '#7c3aed', label: 'Vision',   score: 7.8 },
                { icon: Brain,         color: '#f97316', label: 'Sensory',  score: 8.2 },
              ].map(({ icon: Icon, color, label, score }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2" style={{ borderColor: color }}>
                    <span className="text-sm font-bold text-white">{score}</span>
                  </div>
                  <span className="text-[9px] text-white/45">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-white/35">AI-verified · Hearing loop ✓ · Step-free ✓ · Lift ✓</p>
          </div>
        </div>
      </section>

      {/* ── 2. THE PROBLEM ──────────────────────────────────────────────── */}
      <section aria-labelledby="problem-heading" className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="label">The problem</p>
        <h2 id="problem-heading" className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          1.3 billion people navigate a world<br className="hidden sm:block" /> that isn't built for them.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted leading-relaxed">
          Existing maps are sparse, manual, and hopelessly slow to fill. A venue with 47 Google reviews
          has zero information about whether there's a ramp, how wide the door is, or whether the
          accessible restroom is actually accessible. <strong className="text-ink">AccessMap fixes this with AI.</strong>
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: MapPin, color: '#ea4335', stat: 'Sparse', desc: 'Google Maps shows 1 accessibility tag per venue on average' },
            { icon: Users, color: '#f97316', stat: 'Manual', desc: "Human volunteers can't keep pace with the physical world changing" },
            { icon: AlertTriangle, color: '#eab308', stat: 'Stale', desc: 'Outdated data causes failed journeys — lifts reported working are out of service' },
          ].map(({ icon: Icon, color, stat, desc }) => (
            <div key={stat} className="card p-5 text-center">
              <Icon size={24} className="mx-auto mb-3" style={{ color }} aria-hidden="true" />
              <p className="text-xl font-bold text-ink">{stat}</p>
              <p className="mt-1 text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. HOW IT WORKS (AI step front & centre) ────────────────────── */}
      <section aria-labelledby="how-heading" className="px-3 pb-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#070B18] px-6 py-16">
          <div className="text-center mb-12">
            <p className="label text-[#0ABFBF]/80">How it works</p>
            <h2 id="how-heading" className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Community data. AI precision. At scale.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Camera, color: '#0ABFBF', n: '01',
                title: 'Anyone contributes a photo',
                body: 'A visitor snaps the entrance, ramp, or restroom of any venue. No training required.',
              },
              {
                icon: Cpu, color: '#1a73e8', n: '02',
                title: 'AI extracts the details',
                body: 'Our computer-vision models (Roboflow) detect ramps, step counts, door widths, and barriers automatically — consistent, scalable, and faster than any volunteer network.',
                highlight: true,
              },
              {
                icon: RouteIcon, color: '#7c3aed', n: '03',
                title: 'Trusted ratings & step-free routes',
                body: 'AI-verified scores are published instantly. Users get reliable accessibility ratings and turn-by-turn step-free routing — before they arrive.',
              },
            ].map(({ icon: Icon, color, n, title, body, highlight }) => (
              <div key={n} className={`rounded-2xl p-6 ${highlight ? 'border-2 border-[#1a73e8]/60 bg-[#1a73e8]/10' : 'border border-white/10 bg-white/5'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: color }} aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <span className="font-mono text-sm font-bold" style={{ color }}>{n}</span>
                  {highlight && <span className="ml-auto rounded-full bg-[#1a73e8]/30 px-2 py-0.5 text-[10px] font-semibold text-[#93c5fd] uppercase tracking-wide">AI moat</span>}
                </div>
                <p className="font-semibold text-white leading-snug">{title}</p>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* Accessibility detail types */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="mb-4 text-sm font-semibold text-white/70 text-center">Every detail our AI and community capture</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {DETAIL_CHECKLIST.map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-white/60">
                  <CheckCircle2 size={11} className="shrink-0 text-[#0ABFBF]" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/map" className="btn-primary px-7 py-3 text-base">
              Try AccessMap <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. FOR BUSINESSES & CITIES ──────────────────────────────────── */}
      <section aria-labelledby="b2b-heading" className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl border border-border bg-white p-8 sm:p-12">
          <p className="label">For businesses &amp; cities</p>
          <h2 id="b2b-heading" className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Prove your accessibility.<br />Cut legal risk. Reach 1.3B customers.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted leading-relaxed">
            Accessibility is now a legal and commercial imperative. AccessMap gives organizations
            the data to prove it — license accessibility intelligence for your locations, audit at
            scale with our API, and earn a <strong className="text-ink">Verified Accessible</strong> certification.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {B2B_BUYERS.map(({ icon: Icon, label, body }) => (
              <div key={label} className="rounded-2xl border border-border bg-[#f8f9fa] p-5">
                <Icon size={20} className="mb-3 text-primary" aria-hidden="true" />
                <p className="font-semibold text-ink text-sm">{label}</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/for-business" className="btn-primary px-6 py-2.5 text-sm font-semibold">
              Request data access <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link to="/councils" className="btn-ghost px-6 py-2.5 text-sm font-semibold">
              For municipalities
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. WHY NOW ──────────────────────────────────────────────────── */}
      <section aria-labelledby="why-heading" className="px-3 pb-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#070B18] px-6 py-16">
          <div className="text-center mb-10">
            <p className="label text-[#0ABFBF]/80">Why now</p>
            <h2 id="why-heading" className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Regulation + market are converging.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              This isn't a charity — it's a market. Legal pressure and demographic shift are creating
              urgent demand for accessibility data infrastructure.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {WHY_NOW.map(({ stat, desc, src }) => (
              <div key={stat} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <p className="text-3xl font-bold text-[#0ABFBF]">{stat}</p>
                <p className="mt-2 text-sm text-white/65 leading-snug">{desc}</p>
                <p className="mt-2 text-[10px] text-white/30">{src}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white/50">
            <span className="flex items-center gap-1.5"><Scale size={13} className="text-[#0ABFBF]" aria-hidden="true" /> ADA Title II expansion — state &amp; local government compliance</span>
            <span className="flex items-center gap-1.5"><TrendingUp size={13} className="text-[#0ABFBF]" aria-hidden="true" /> Aging global population driving mainstream accessibility demand</span>
          </div>
        </div>
      </section>

      {/* ── 6. TRACTION / PROOF ─────────────────────────────────────────── */}
      <section aria-labelledby="traction-heading" className="mx-auto max-w-5xl px-6 py-16">
        <p className="label text-center">Traction</p>
        <h2 id="traction-heading" className="mt-3 text-center text-3xl font-semibold text-ink sm:text-4xl">
          Launched and growing.
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { n: '50M+', label: 'locations available', detail: 'via OpenStreetMap + AI enrichment', icon: MapPin, color: '#1a73e8' },
            { n: 'Beta', label: 'live at accessmap.world', detail: 'Free consumer app, fully functional', icon: Zap, color: '#0ABFBF' },
            { n: 'B2B', label: 'in active conversations', detail: 'Cedar Park EDC · Plug and Play · venues', icon: Building2, color: '#7c3aed' },
          ].map(({ n, label, detail, icon: Icon, color }) => (
            <div key={n} className="card p-6 text-center">
              <Icon size={22} className="mx-auto mb-3" style={{ color }} aria-hidden="true" />
              <p className="text-4xl font-bold" style={{ color }}>{n}</p>
              <p className="mt-1 font-semibold text-ink">{label}</p>
              <p className="mt-1 text-sm text-muted">{detail}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, initials, color }) => (
            <figure key={name} className="card flex flex-col gap-4 p-5">
              <div className="flex gap-0.5" aria-label="5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-[#f59e0b] text-[#f59e0b]" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="text-sm text-ink leading-relaxed flex-1">"{quote}"</blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: color }} aria-hidden="true">
                  {initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{name}</p>
                  <p className="text-xs text-muted">{role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="cta-heading" className="px-3 pb-16">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#070B18] px-6 py-16 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
            <Aurora colorStops={['#1a73e8', '#0ABFBF', '#1a73e8']} amplitude={0.9} blend={0.5} />
          </div>
          <div className="relative z-10">
            <ShieldCheck className="mx-auto text-[#0ABFBF]" size={40} aria-hidden="true" />
            <h2 id="cta-heading" className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Build the world's accessibility layer with us.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/65 leading-relaxed">
              Explore your city, drop a review, flag a broken lift — every contribution feeds the AI
              and helps someone get where they need to go.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/map" className="btn-primary px-7 py-3 text-base font-semibold">
                Explore the map <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/for-business" className="btn bg-white/10 border border-white/20 px-7 py-3 text-base font-semibold text-white hover:bg-white/20 backdrop-blur">
                Partner with us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-12 text-center text-sm text-muted" role="contentinfo">
        <div className="flex items-center justify-center gap-2">
          <MapPin size={16} className="text-primary" aria-hidden="true" />
          <span className="font-semibold text-ink">Access<span className="text-primary">Map</span></span>
        </div>
        <p className="mt-2">AI-powered accessibility intelligence · Built for 1.3B people with disabilities</p>
        <nav aria-label="Footer navigation" className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/map" className="hover:text-ink hover:underline">Map</Link>
          <Link to="/for-business" className="hover:text-ink hover:underline">For Business</Link>
          <Link to="/councils" className="hover:text-ink hover:underline">For Councils</Link>
          <Link to="/accessibility" className="hover:text-ink hover:underline font-medium text-primary">Accessibility Statement</Link>
          <Link to="/report" className="hover:text-ink hover:underline">Report an Issue</Link>
          <Link to="/privacy" className="hover:text-ink hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-ink hover:underline">Terms of Service</Link>
        </nav>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          <span>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-ink">OpenStreetMap</a> contributors</span>
          <span>© <a href="https://carto.com/attributions" target="_blank" rel="noreferrer" className="underline hover:text-ink">CARTO</a></span>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1"><BadgeCheck size={12} className="text-[#1e8e3e]" aria-hidden="true" /> WCAG 2.2 AA target</span>
          <span className="inline-flex items-center gap-1"><ShieldCheck size={12} className="text-primary" aria-hidden="true" /> AI-verified data</span>
          <span className="inline-flex items-center gap-1"><CheckCircle2 size={12} className="text-[#0ABFBF]" aria-hidden="true" /> Free for everyone</span>
        </div>
        <p className="mt-4 text-xs text-muted/50">
          © {new Date().getFullYear()} AccessMap. Accessibility data is community-sourced and AI-assisted — do not rely solely on AccessMap for safety-critical decisions.
        </p>
      </footer>
    </Layout>
  )
}
