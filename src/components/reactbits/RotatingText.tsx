// @ts-nocheck
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import './RotatingText.css'

function cn(...classes) { return classes.filter(Boolean).join(' ') }

const RotatingText = forwardRef((props, ref) => {
  const {
    texts,
    transition = { type: 'spring', damping: 25, stiffness: 300 },
    initial = { y: '100%', opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: '-120%', opacity: 0 },
    animatePresenceMode = 'wait',
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = 'first',
    loop = true,
    auto = true,
    splitBy = 'characters',
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  const splitIntoCharacters = text => {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
      return Array.from(segmenter.segment(text), s => s.segment)
    }
    return Array.from(text)
  }

  const elements = useMemo(() => {
    const currentText = texts[currentTextIndex]
    if (splitBy === 'characters') {
      const words = currentText.split(' ')
      return words.map((word, i) => ({ characters: splitIntoCharacters(word), needsSpace: i !== words.length - 1 }))
    }
    return currentText.split(splitBy === 'words' ? ' ' : splitBy).map((part, i, arr) => ({
      characters: [part], needsSpace: i !== arr.length - 1,
    }))
  }, [texts, currentTextIndex, splitBy])

  const getStaggerDelay = useCallback((index, total) => {
    if (staggerFrom === 'first') return index * staggerDuration
    if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration
    if (staggerFrom === 'center') return Math.abs(Math.floor(total / 2) - index) * staggerDuration
    return Math.abs(staggerFrom - index) * staggerDuration
  }, [staggerFrom, staggerDuration])

  const handleIndexChange = useCallback(i => { setCurrentTextIndex(i); onNext?.(i) }, [onNext])
  const next = useCallback(() => {
    const ni = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1
    if (ni !== currentTextIndex) handleIndexChange(ni)
  }, [currentTextIndex, texts.length, loop, handleIndexChange])

  useImperativeHandle(ref, () => ({ next }), [next])
  useEffect(() => {
    if (!auto) return
    const id = setInterval(next, rotationInterval)
    return () => clearInterval(id)
  }, [next, rotationInterval, auto])

  return (
    <motion.span className={cn('text-rotate', mainClassName)} {...rest} layout transition={transition}>
      <span className="text-rotate-sr-only">{texts[currentTextIndex]}</span>
      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <motion.span key={currentTextIndex} className="text-rotate" layout aria-hidden="true">
          {elements.map((wordObj, wordIndex, array) => {
            const prevCount = array.slice(0, wordIndex).reduce((s, w) => s + w.characters.length, 0)
            return (
              <span key={wordIndex} className={cn('text-rotate-word', splitLevelClassName)}>
                {wordObj.characters.map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{ ...transition, delay: getStaggerDelay(prevCount + charIndex, array.reduce((s, w) => s + w.characters.length, 0)) }}
                    className={cn('text-rotate-element', elementLevelClassName)}
                  >
                    {char}
                  </motion.span>
                ))}
                {wordObj.needsSpace && <span className="text-rotate-space"> </span>}
              </span>
            )
          })}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
})
RotatingText.displayName = 'RotatingText'
export default RotatingText
