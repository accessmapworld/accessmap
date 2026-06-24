import { Link } from 'react-router-dom'
import {
  MapPin, Accessibility, AlertTriangle, Route as RouteIcon, Megaphone,
  ArrowRight, Star, ShieldCheck, Ear, Eye,
} from 'lucide-react'
import Layout from '../components/Layout'
import Aurora from '../components/reactbits/Aurora'
import GradientText from '../components/reactbits/GradientText'
import RotatingTextC from '../components/reactbits/RotatingText'
import ShinyText from '../components/reactbits/ShinyText'
import ScrollVelocityC from '../components/reactbits/ScrollVelocity'
import BlurText from '../components/reactbits/BlurText'
import MagicBento from '../components/reactbits/MagicBento'
import GlitchText from '../components/reactbits/GlitchText'
import CardSwapC, { Card as CardC } from '../components/reactbits/CardSwap'

// React Bits components are untyped (@ts-nocheck) — relax their JSX prop types.
const RotatingText = RotatingTextC as unknown as (props: Record<string, unknown>) => any
const ScrollVelocity = ScrollVelocityC as unknown as (props: Record<string, unknown>) => any
const CardSwap = CardSwapC as unknown as (props: Record<string, unknown>) => any
const Card = CardC as unknown as (props: Record<string, unknown>) => any

const FEATURES = [
  { icon: Accessibility, color: '#0ABFBF', title: 'Four-dimension scores', body: 'Every place rated for mobility, sensory, hearing and vision by the people who live it.' },
  { icon: AlertTriangle, color: '#ea4335', title: 'Live community alerts', body: '“Elevator offline”, “ramp blocked” — real-time reports, AI-verified from photos.' },
  { icon: RouteIcon, color: '#1a73e8', title: 'Step-free routing', body: 'Plan accessible walking routes and open turn-by-turn directions in Google Maps.' },
  { icon: Megaphone, color: '#f5b50a', title: 'Disability-friendly businesses', body: 'Businesses self-list and get discovered by a community that values access.' },
]

const STATS = [
  { n: '4', label: 'accessibility dimensions' },
  { n: '5', label: 'cities seeded' },
  { n: '100%', label: 'community-driven' },
  { n: 'Free', label: 'forever, for everyone' },
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
        <div className="mt-3 flex justify-center">
          <BlurText
            text="Make the whole world navigable — for everyone."
            className="justify-center text-center text-3xl font-semibold leading-tight sm:text-4xl"
            delay={90}
          />
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-muted">
          Accessibility information is scattered, outdated, or missing. AccessMap is a single, living map
          where the disability community shares what’s truly accessible, flags what breaks, and routes
          around the barriers — so everyone can move through the world with confidence and dignity.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><Accessibility size={15} className="text-accent" /> Mobility</span>
          <span className="inline-flex items-center gap-1.5"><Star size={15} className="text-yellow-500" /> Sensory</span>
          <span className="inline-flex items-center gap-1.5"><Ear size={15} className="text-primary" /> Hearing</span>
          <span className="inline-flex items-center gap-1.5"><Eye size={15} className="text-alert" /> Vision</span>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-border bg-card py-6 text-ink/15">
        <ScrollVelocity
          texts={['Step-free  ·  Quiet spaces  ·  Braille  ·  Hearing loops  ·  Ramps  ·  Elevators  ·  ']}
          velocity={40}
          className="px-3 text-3xl sm:text-5xl"
        />
      </section>

      {/* HOW IT WORKS — CardSwap */}
      <section className="px-3 py-16">
        <div className="relative mx-auto grid max-w-5xl items-center gap-8 overflow-hidden rounded-3xl bg-[#070B18] px-6 py-14 lg:grid-cols-2">
          <div className="relative z-10">
            <p className="label text-primary/80">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Three taps to an accessible trip</h2>
            <ol className="mt-6 space-y-4 text-white/75">
              <li className="flex gap-3"><span className="font-mono text-primary">01</span> Search a place — or tap a category near you.</li>
              <li className="flex gap-3"><span className="font-mono text-primary">02</span> Check its accessibility score &amp; live alerts.</li>
              <li className="flex gap-3"><span className="font-mono text-primary">03</span> Plan a step-free route &amp; open it in Google Maps.</li>
            </ol>
            <Link to="/map" className="btn-primary mt-7 inline-flex">Try it now <ArrowRight size={18} /></Link>
          </div>
          <div className="relative h-[300px]">
            <CardSwap width={340} height={220} cardDistance={48} verticalDistance={54} delay={3800} pauseOnHover>
              <Card>
                <div className="p-6"><p className="label text-primary">Search</p><h3 className="mt-2 text-xl font-semibold">Find what’s near you</h3><p className="mt-2 text-sm text-white/70">Restaurants, transit, pharmacies — colour-coded for access.</p></div>
              </Card>
              <Card>
                <div className="p-6"><p className="label text-[#f5b50a]">Review</p><h3 className="mt-2 text-xl font-semibold">See the real scores</h3><p className="mt-2 text-sm text-white/70">Mobility, sensory, hearing, vision — plus live alerts.</p></div>
              </Card>
              <Card>
                <div className="p-6"><p className="label text-[#1a73e8]">Route</p><h3 className="mt-2 text-xl font-semibold">Go step-free</h3><p className="mt-2 text-sm text-white/70">Accessible directions, one tap to Google Maps.</p></div>
              </Card>
            </CardSwap>
          </div>
        </div>
      </section>

      {/* CAPABILITIES — MagicBento */}
      <section className="px-6 py-12">
        <div className="text-center">
          <p className="label">Everything in one map</p>
          <h2 className="mt-2 text-3xl font-semibold">Capabilities</h2>
        </div>
        <div className="mt-10 rounded-3xl bg-[#070B18] p-5 sm:p-7">
          <MagicBento glowColor="10, 191, 191" particleCount={8} />
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-5xl px-6 pb-4">
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
      <section className="px-3 py-16">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#070B18] px-6 py-16 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <Aurora colorStops={['#1a73e8', '#0ABFBF', '#1a73e8']} amplitude={0.9} blend={0.5} />
          </div>
          <div className="relative z-10">
            <ShieldCheck className="mx-auto text-primary" size={36} />
            <div className="mt-4 flex justify-center">
              <GlitchText className="text-3xl sm:text-4xl" speed={1.2}>Map accessibility with us</GlitchText>
            </div>
            <p className="mx-auto mt-2 max-w-md text-white/65">
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

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        <div className="flex items-center justify-center gap-2">
          <MapPin size={16} className="text-primary" />
          <span className="font-semibold text-ink">Access<span className="text-primary">Map</span></span>
        </div>
        <p className="mt-2">Crowdsourced accessibility intelligence · Built for the community</p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link to="/map" className="hover:text-ink">Map</Link>
          <Link to="/business" className="hover:text-ink">For Business</Link>
          <Link to="/privacy" className="hover:text-ink">Privacy</Link>
          <Link to="/terms" className="hover:text-ink">Terms</Link>
        </nav>
        <p className="mt-3 text-xs">
          Map data ©{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-ink">
            OpenStreetMap
          </a>{' '}
          contributors
        </p>
      </footer>
    </Layout>
  )
}
