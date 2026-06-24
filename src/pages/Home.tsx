import { Link } from 'react-router-dom'
import {
  MapPin, Accessibility, AlertTriangle, Route as RouteIcon, Megaphone,
  ArrowRight, Star, ShieldCheck, Ear, Eye, Mountain, Brain,
  CheckCircle2, Database, Users, Zap, Globe,
} from 'lucide-react'
import Layout from '../components/Layout'
import Aurora from '../components/reactbits/Aurora'
import GradientText from '../components/reactbits/GradientText'
import RotatingTextC from '../components/reactbits/RotatingText'
import ShinyText from '../components/reactbits/ShinyText'

const RotatingText = RotatingTextC as unknown as (props: Record<string, unknown>) => any

const FEATURES = [
  { icon: Accessibility, color: '#0ABFBF', title: 'Mobility & wheelchair access', body: 'Step-free entrances, ramp specs, lift dimensions, disabled parking — the details that matter.' },
  { icon: AlertTriangle, color: '#f97316', title: 'Live community alerts', body: 'Real-time "elevator offline" reports, ramp blockages and access changes, verified fast.' },
  { icon: RouteIcon, color: '#1a73e8', title: 'Step-free routing', body: 'Plan accessible routes then open turn-by-turn directions straight in Google Maps.' },
  { icon: Brain, color: '#7c3aed', title: 'Sensory & hearing support', body: 'Hearing loops, quiet rooms, braille menus, changing facilities — all in one place.' },
]

const SCORES = [
  { icon: Accessibility, color: '#0ABFBF', label: 'Mobility', score: 8.2 },
  { icon: Ear,           color: '#1a73e8', label: 'Hearing',  score: 7.5 },
  { icon: Eye,           color: '#7c3aed', label: 'Vision',   score: 6.8 },
  { icon: Brain,         color: '#f97316', label: 'Sensory',  score: 7.1 },
]

const TESTIMONIALS = [
  {
    quote: 'Finally a map that tells me if there\'s actually a ramp, how wide it is, and whether the lift is working. This is life-changing for planning days out.',
    name: 'Sarah K.',
    role: 'Manual wheelchair user',
    initials: 'SK',
    color: '#0ABFBF',
  },
  {
    quote: 'I have hearing loss and AccessMap is the only tool that shows me which venues have hearing loops before I arrive. The alerts are incredibly useful.',
    name: 'David M.',
    role: 'Hard of hearing',
    initials: 'DM',
    color: '#1a73e8',
  },
  {
    quote: 'As a carer I used to spend hours ringing ahead to check access. Now I can see everything in seconds — door widths, accessible WC, parking. Brilliant.',
    name: 'Priya T.',
    role: 'Accessibility advocate',
    initials: 'PT',
    color: '#7c3aed',
  },
]

const DATA_SOURCES = [
  { icon: Globe, label: 'OpenStreetMap', desc: '50M+ tagged locations' },
  { icon: Database, label: 'Wikidata', desc: 'Structured accessibility facts' },
  { icon: Users, label: 'Community', desc: 'Real lived experience' },
]

const STATS = [
  { n: '50M+', label: 'locations mapped', icon: MapPin },
  { n: '4', label: 'accessibility dimensions', icon: Accessibility },
  { n: 'Live', label: 'alerts & updates', icon: Zap },
  { n: 'Free', label: 'forever, for everyone', icon: CheckCircle2 },
]

export default function Home() {
  return (
    <Layout bare>
      {/* HERO */}
      <section className="relative mx-3 mt-3 overflow-hidden rounded-3xl bg-[#070B18] px-6 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <Aurora colorStops={['#0ABFBF', '#1a73e8', '#7C3AED']} amplitude={1.1} blend={0.55} />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
            <MapPin size={14} className="text-[#0ABFBF]" />
            <ShinyText text="Crowdsourced accessibility intelligence" color="#c7ccd6" shineColor="#0ABFBF" speed={3} />
          </span>

          <h1 className="mt-6 font-semibold leading-[1.05] tracking-tight text-white">
            <span className="block text-4xl sm:text-6xl">Find places that</span>
            <span className="mt-1 block text-4xl sm:text-6xl">
              <GradientText colors={['#0ABFBF', '#7df9ff', '#1a73e8', '#0ABFBF']} animationSpeed={6}>
                actually work for you
              </GradientText>
            </span>
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-lg text-white/80 sm:text-2xl">
            <span>Accessible</span>
            <RotatingText
              texts={['restaurants', 'transit', 'schools', 'parks', 'hospitals', 'hotels', 'shops']}
              mainClassName="rounded-lg bg-primary px-3 py-1 text-white font-semibold"
              staggerFrom="last"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.02}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              rotationInterval={2200}
            />
            <span>near you</span>
          </div>

          <p className="mx-auto mt-6 max-w-xl text-white/65">
            Real accessibility data — ramp widths, lift dimensions, hearing loops, step counts — sourced from
            OpenStreetMap, Wikidata and the disability community.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/map" className="btn-primary px-6 py-3 text-base">
              Open the map <ArrowRight size={18} />
            </Link>
            <Link to="/business" className="btn bg-white px-6 py-3 text-base text-[#070B18] hover:shadow-lg">
              <Megaphone size={18} /> List your business
            </Link>
          </div>

          {/* Mini score preview */}
          <div className="mt-12 mx-auto max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              <p className="text-xs text-white/60 font-medium">Example: Royal Festival Hall</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {SCORES.map(({ icon: Icon, color, label, score }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2" style={{ borderColor: color }}>
                    <span className="text-sm font-bold text-white">{score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon size={10} style={{ color }} />
                    <span className="text-[9px] text-white/50">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DATA SOURCES */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted mb-6">Data sources</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {DATA_SOURCES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-3 shadow-lift">
              <Icon size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold text-ink">{label}</p>
                <p className="text-xs text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="label">Our mission</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
          Make the whole world navigable — for everyone.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-muted leading-relaxed">
          Accessibility information is scattered, outdated or missing entirely. AccessMap is a single,
          living map where the disability community shares what's truly accessible, flags what breaks,
          and routes around the barriers — so everyone can move through the world with confidence.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><Accessibility size={15} className="text-[#0ABFBF]" /> Mobility</span>
          <span className="inline-flex items-center gap-1.5"><Ear size={15} className="text-primary" /> Hearing</span>
          <span className="inline-flex items-center gap-1.5"><Eye size={15} className="text-alert" /> Vision</span>
          <span className="inline-flex items-center gap-1.5"><Brain size={15} className="text-[#7c3aed]" /> Sensory</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-3 pb-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#070B18] px-6 py-14 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="relative z-10">
            <p className="label text-[#0ABFBF]/80">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Three steps to an accessible trip</h2>
            <ol className="mt-6 space-y-6">
              {[
                { step: 'Search a place', detail: 'Or tap a category — hospitals, cafes, parks — and AccessMap searches OpenStreetMap for nearby venues.' },
                { step: 'Check the details', detail: 'See the full accessibility breakdown: ramp specs, lift dimensions, door widths, step counts, hearing loops and live alerts.' },
                { step: 'Plan your route', detail: 'Get step-free directions and open them in Google Maps with one tap.' },
              ].map(({ step, detail }, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 font-mono text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{step}</p>
                    <p className="mt-1 text-sm text-white/60 leading-relaxed">{detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/map" className="btn-primary mt-8 inline-flex">Try it now <ArrowRight size={18} /></Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-0">
            {FEATURES.map(({ icon: Icon, color, title, body }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: color }}>
                  <Icon size={18} />
                </span>
                <p className="mt-3 font-semibold text-white text-sm">{title}</p>
                <p className="mt-1 text-xs text-white/55 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map(({ n, label, icon: Icon }) => (
            <div key={label} className="card p-5 text-center">
              <Icon size={20} className="mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-primary">{n}</p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <p className="label mb-6 text-center">What people say</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, initials, color }) => (
            <div key={name} className="card flex flex-col gap-4 p-5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>
              <p className="text-sm text-ink leading-relaxed flex-1">"{quote}"</p>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: color }}>
                  {initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{name}</p>
                  <p className="text-xs text-muted">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="rounded-3xl border border-border bg-white p-8">
          <h2 className="text-2xl font-semibold text-ink mb-2">Every detail a disabled person actually needs</h2>
          <p className="text-muted mb-6">AccessMap shows the specific specs that general maps leave out.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Ramp gradient & width',
              'Handrail presence',
              'Step count & height',
              'Kerb type (flush / lowered)',
              'Door width & type (auto/manual)',
              'Lift dimensions (W × D)',
              'Accessible WC with grab rails',
              'WC turning space',
              'Disabled parking spaces',
              'Hearing loop availability',
              'Braille menus',
              'Quiet / sensory rooms',
              'Changing Place facilities',
              'Assistance dog welcome',
              'Wheelchair seating count',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5 rounded-xl bg-[#f8f9fa] px-3 py-2.5 text-sm">
                <CheckCircle2 size={14} className="shrink-0 text-[#1e8e3e]" />
                <span className="text-ink">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-3 pb-16">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#070B18] px-6 py-16 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <Aurora colorStops={['#1a73e8', '#0ABFBF', '#1a73e8']} amplitude={0.9} blend={0.5} />
          </div>
          <div className="relative z-10">
            <ShieldCheck className="mx-auto text-primary" size={36} />
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Map accessibility with us</h2>
            <p className="mx-auto mt-3 max-w-md text-white/65">
              Explore your city, drop a review, or flag a broken lift — every contribution helps someone get where they need to go.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/map" className="btn-primary px-6 py-3 text-base">Open the map <ArrowRight size={18} /></Link>
              <Link to="/submit-review" className="btn bg-white px-6 py-3 text-base text-[#070B18] hover:shadow-lg">
                <Star size={18} /> Write a review
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-sm text-muted">
        <div className="flex items-center justify-center gap-2">
          <MapPin size={16} className="text-primary" />
          <span className="font-semibold text-ink">Access<span className="text-primary">Map</span></span>
        </div>
        <p className="mt-2">Crowdsourced accessibility intelligence · Built for the community</p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link to="/map" className="hover:text-ink">Map</Link>
          <Link to="/business" className="hover:text-ink">For Business</Link>
          <Link to="/councils" className="hover:text-ink">For Councils</Link>
          <Link to="/security" className="hover:text-ink">Security</Link>
          <Link to="/report" className="hover:text-ink">Report an Issue</Link>
          <Link to="/privacy" className="hover:text-ink">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-ink">Terms of Service</Link>
        </nav>
        <p className="mt-3 text-xs">
          Map data ©{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-ink">
            OpenStreetMap
          </a>{' '}
          contributors · © <a href="https://carto.com/attributions" target="_blank" rel="noreferrer" className="underline hover:text-ink">CARTO</a>
        </p>
        <p className="mt-2 text-xs text-muted/60">
          © {new Date().getFullYear()} AccessMap. Accessibility data is community-sourced and may not be complete or accurate. Do not rely solely on AccessMap for safety-critical decisions.
        </p>
      </footer>
    </Layout>
  )
}
