// @ts-nocheck
import { useRef, useLayoutEffect, useState } from 'react'
import { motion, useScroll, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame } from 'motion/react'
import './ScrollVelocity.css'

function useElementWidth(ref) {
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    function update() { if (ref.current) setWidth(ref.current.offsetWidth) }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [ref])
  return width
}

export const ScrollVelocity = ({
  texts = [],
  velocity = 100,
  className = '',
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName = 'parallax',
  scrollerClassName = 'scroller',
}) => {
  function VelocityText({ children, baseVelocity = velocity }) {
    const baseX = useMotionValue(0)
    const { scrollY } = useScroll()
    const scrollVelocity = useVelocity(scrollY)
    const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness })
    const velocityFactor = useTransform(smoothVelocity, velocityMapping.input, velocityMapping.output, { clamp: false })
    const copyRef = useRef(null)
    const copyWidth = useElementWidth(copyRef)
    function wrap(min, max, v) { const range = max - min; const mod = (((v - min) % range) + range) % range; return mod + min }
    const x = useTransform(baseX, v => (copyWidth === 0 ? '0px' : `${wrap(-copyWidth, 0, v)}px`))
    const directionFactor = useRef(1)
    useAnimationFrame((t, delta) => {
      let moveBy = directionFactor.current * baseVelocity * (delta / 1000)
      if (velocityFactor.get() < 0) directionFactor.current = -1
      else if (velocityFactor.get() > 0) directionFactor.current = 1
      moveBy += directionFactor.current * moveBy * velocityFactor.get()
      baseX.set(baseX.get() + moveBy)
    })
    const spans = []
    for (let i = 0; i < numCopies; i++)
      spans.push(<span className={className} key={i} ref={i === 0 ? copyRef : null}>{children}&nbsp;</span>)
    return (
      <div className={parallaxClassName}>
        <motion.div className={scrollerClassName} style={{ x }}>{spans}</motion.div>
      </div>
    )
  }
  return (
    <section>
      {texts.map((text, index) => (
        <VelocityText key={index} baseVelocity={index % 2 !== 0 ? -velocity : velocity}>{text}</VelocityText>
      ))}
    </section>
  )
}
export default ScrollVelocity
