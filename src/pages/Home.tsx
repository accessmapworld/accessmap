import { Link } from 'react-router-dom'
import {
  MapPin, Accessibility, AlertTriangle, Route as RouteIcon, Megaphone,
  ArrowRight, Star, ShieldCheck, Ear, Eye, Mountain,
} from 'lucide-react'
import Layout from '../components/Layout'
import Aurora from '../components/reactbits/Aurora'
import GradientText from '../components/reactbits/GradientText'
import RotatingTextC from '../components/reactbits/RotatingText'
import ShinyText from '../components/reactbits/ShinyText'

const RotatingText = RotatingTextC as unknown as (props: Record<string, unknown>) => any

const FEATURES = [
  { icon: Accessibility, color: '#0ABFBF', title: 'Four accessibility dimensions', body: 'Every place rated for mobility, sensory, hearing and vision by the people who live it.' },
  { icon: AlertTriangle, color: '#f97316', title: 'Live community alerts', body: 'Real-time reports like "elevator offline" or "ramp blocked", community-verified.' },
  { icon: RouteIcon, color: '#1a73e8', title: 'Step-free routing', body: 'Plan accessible walking routes and open turn-by-turn directions in Google Maps.' },
  { icon: Mountain, color: '#7c3aed', title: 'Terrain & trail ratings', body: 'Know the ground before you go — surface type and trail difficulty for every location.' },
]

const STATS = [
  { n: '4', label: 'accessibility dimensions' },
  { n: '100%', label: 'community-driven' },
  { n: 'Free', label: 'forever, for everyone' },
  { n: 'Live', label: 'alerts & updates' },
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
            <MapPin size={14} className="text-primary" />
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

          <div className="mt-6 flex items-center justify-center gap-2 text-lg text-white/80 sm:text-2xl">
            <span>Accessible</span>
            <RotatingText
              texts={['restaurants', 'transit', 'schools', 'parks', 'hospitals', 'hotels']}
              mainClassName="rounded-lg bg-primary px-3 py-1 text-white font-semibold"
              staggerFrom="last"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.02}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              rotationInterval={2200}
            />
          </div>

          <p className="mx-auto mt-6 max-w-xl text-white/65">
            AccessMap turns lived experience into a map anyone can trust — scores, live alerts and
            step-free routes for people with disabilities.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/map" className="btn-primary px-6 py-3 text-base">
              Open the map <ArrowRight size={18} />
            </Link>
            <Link to="/business" className="btn bg-white px-6 py-3 text-base text-[#070B18] hover:shadow-lg">
              <Megaphone size={18} /> List your business
            </Link>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="label">Our mission</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
          Make the whole world navigable — for everyone.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-muted">
          Accessibility information is scattered, outdated, or missing. AccessMap is a single, living map
          where the disability community shares what's truly accessible, flags what breaks, and routes
          around the barriers — so everyone can move through the world with confidence and dignity.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><Accessibility size={15} className="text-accent" /> Mobility</span>
          <span className="inline-flex items-center gap-1.5"><Star size={15} className="text-yellow-500" /> Sensory</span>
          <span className="inline-flex items-center gap-1.5"><Ear size={15} className="text-primary" /> Hearing</span>
          <span className="inline-flex items-center gap-1.5"><Eye size={15} className="text-alert" /> Vision</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-3 pb-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#070B18] px-6 py-14 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="relative z-10">
            <p className="label text-primary/80">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Three steps to an accessible trip</h2>
            <ol className="mt-6 space-y-5 text-white/75">
              {[
                'Search a place — or tap a category near you.',
                'Check its accessibility score, terrain rating & live alerts.',
                'Plan a step-free route & open it in Google Maps.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 font-mono text-sm text-primary">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <Link to="/map" className="btn-primary mt-8 inline-flex">Try it now <ArrowRight size={18} /></Link>
          </div>

          {/* Features grid replaces CardSwap */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-0">
            {FEATURES.map(({ icon: Icon, color, title, body }) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: color }}>
                  <Icon size={18} />
                </span>
                <p className="mt-3 font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-white/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <p className="text-3xl font-bold text-primary">{s.n}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
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
              Explore your city, drop a review, or flag an issue — every contribution helps someone get there.
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
        <p className="mt-2 text-xs text-muted/60">© {new Date().getFullYear()} AccessMap. Accessibility data is community-sourced and may not be complete or accurate. Do not rely solely on AccessMap for safety-critical decisions.</p>
      </footer>
    </Layout>
  )
}
