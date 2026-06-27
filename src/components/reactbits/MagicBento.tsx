// @ts-nocheck
import { useRef, useEffect, useCallback, useState } from 'react'
import { gsap } from 'gsap'
import './MagicBento.css'

const DEFAULT_GLOW = '10, 191, 191'
const MOBILE_BP = 768

const DEFAULT_CARDS = [
  { title: 'Accessibility scores', description: 'Mobility · sensory · hearing · vision, rated 0–10 by the community.', label: 'Ratings' },
  { title: 'Live alerts', description: 'Real-time “elevator offline” / “ramp blocked”, AI-verified from photos.', label: 'Realtime' },
  { title: 'Step-free routes', description: 'Plan accessible walking routes, open directions in Google Maps.', label: 'Routing' },
  { title: 'Category search', description: 'Find restaurants, hotels, pharmacies and more near you.', label: 'Discover' },
  { title: 'Photo verification', description: 'Uploads checked by AI before they earn a verified badge.', label: 'Trust' },
  { title: 'For business', description: 'List your venue as disability-friendly and get discovered.', label: 'Growth' },
]

const createParticle = (x, y, color) => {
  const el = document.createElement('div')
  el.className = 'mb-particle'
  el.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(${color},1);box-shadow:0 0 6px rgba(${color},0.6);pointer-events:none;z-index:100;left:${x}px;top:${y}px;`
  return el
}

const ParticleCard = ({ children, className = '', style, particleCount = 10, glowColor = DEFAULT_GLOW, enableTilt = true, clickEffect = true, enableMagnetism = true, disableAnimations = false }) => {
  const cardRef = useRef(null)
  const particlesRef = useRef([])
  const timeoutsRef = useRef([])
  const isHoveredRef = useRef(false)
  const memo = useRef([])
  const inited = useRef(false)
  const magnetRef = useRef(null)

  const initParticles = useCallback(() => {
    if (inited.current || !cardRef.current) return
    const { width, height } = cardRef.current.getBoundingClientRect()
    memo.current = Array.from({ length: particleCount }, () => createParticle(Math.random() * width, Math.random() * height, glowColor))
    inited.current = true
  }, [particleCount, glowColor])

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []
    magnetRef.current?.kill()
    particlesRef.current.forEach(p => gsap.to(p, { scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)', onComplete: () => p.parentNode?.removeChild(p) }))
    particlesRef.current = []
  }, [])

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return
    if (!inited.current) initParticles()
    memo.current.forEach((particle, index) => {
      const id = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return
        const clone = particle.cloneNode(true)
        cardRef.current.appendChild(clone); particlesRef.current.push(clone)
        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' })
        gsap.to(clone, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true })
        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true })
      }, index * 100)
      timeoutsRef.current.push(id)
    })
  }, [initParticles])

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return
    const el = cardRef.current
    const enter = () => { isHoveredRef.current = true; animateParticles(); if (enableTilt) gsap.to(el, { rotateX: 4, rotateY: 4, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 }) }
    const leave = () => { isHoveredRef.current = false; clearParticles(); if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' }); if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' }) }
    const move = e => {
      if (!enableTilt && !enableMagnetism) return
      const r = el.getBoundingClientRect(); const x = e.clientX - r.left; const y = e.clientY - r.top; const cx = r.width / 2; const cy = r.height / 2
      if (enableTilt) gsap.to(el, { rotateX: ((y - cy) / cy) * -8, rotateY: ((x - cx) / cx) * 8, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 })
      if (enableMagnetism) magnetRef.current = gsap.to(el, { x: (x - cx) * 0.04, y: (y - cy) * 0.04, duration: 0.3, ease: 'power2.out' })
    }
    const click = e => {
      if (!clickEffect) return
      const r = el.getBoundingClientRect(); const x = e.clientX - r.left; const y = e.clientY - r.top
      const maxD = Math.max(Math.hypot(x, y), Math.hypot(x - r.width, y), Math.hypot(x, y - r.height), Math.hypot(x - r.width, y - r.height))
      const ripple = document.createElement('div')
      ripple.style.cssText = `position:absolute;width:${maxD * 2}px;height:${maxD * 2}px;border-radius:50%;background:radial-gradient(circle,rgba(${glowColor},0.4) 0%,rgba(${glowColor},0.2) 30%,transparent 70%);left:${x - maxD}px;top:${y - maxD}px;pointer-events:none;z-index:1000;`
      el.appendChild(ripple)
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() })
    }
    el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave); el.addEventListener('mousemove', move); el.addEventListener('click', click)
    return () => { isHoveredRef.current = false; el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave); el.removeEventListener('mousemove', move); el.removeEventListener('click', click); clearParticles() }
  }, [animateParticles, clearParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor])

  return <div ref={cardRef} className={`${className} mb-particle-container`} style={{ ...style, position: 'relative', overflow: 'hidden' }}>{children}</div>
}

export default function MagicBento({ glowColor = DEFAULT_GLOW, particleCount = 10, cards = DEFAULT_CARDS }) {
  const gridRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  useEffect(() => { const c = () => setIsMobile(window.innerWidth <= MOBILE_BP); c(); window.addEventListener('resize', c); return () => window.removeEventListener('resize', c) }, [])

  // Disable hover particles / tilt / magnetism when the user prefers reduced
  // motion — via the OS setting or AccessMap's own accessibility toggles.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const check = () => setReduceMotion(
      mq.matches ||
      document.documentElement.classList.contains('a11y-reduce-motion') ||
      document.documentElement.classList.contains('a11y-mode'),
    )
    check()
    mq.addEventListener('change', check)
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => { mq.removeEventListener('change', check); obs.disconnect() }
  }, [])

  return (
    <div className="mb-grid" ref={gridRef}>
      {cards.map((card, i) => (
        <ParticleCard key={i} className="mb-card mb-card--glow" style={{ '--glow-color': glowColor }} glowColor={glowColor} particleCount={particleCount} disableAnimations={isMobile || reduceMotion}>
          <div className="mb-card__header"><div className="mb-card__label">{card.label}</div></div>
          <div className="mb-card__content"><h3 className="mb-card__title">{card.title}</h3><p className="mb-card__desc">{card.description}</p></div>
        </ParticleCard>
      ))}
    </div>
  )
}
