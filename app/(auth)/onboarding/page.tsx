'use client'

import { ChevronRight } from '@components/ui/icons'
import { cn } from '@utils/cn'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// --- Slide Illustrations ---

function SlideSnap() {
  return (
    <div className="w-full h-72 flex items-center justify-center">
      <div className="relative w-64 h-64 bg-zinc-900 rounded-3xl flex items-center justify-center overflow-hidden">
        {/* Corner alignment marks */}
        {[
          'top-5 left-5 border-t-2 border-l-2',
          'top-5 right-5 border-t-2 border-r-2',
          'bottom-5 left-5 border-b-2 border-l-2',
          'bottom-5 right-5 border-b-2 border-r-2',
        ].map((cls, i) => (
          <div key={i} className={cn('absolute w-5 h-5 border-white/60', cls)} />
        ))}

        {/* Receipt mockup */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          className="w-32 bg-white rounded-xl p-3 shadow-2xl"
        >
          <div className="space-y-1.5">
            <div className="h-2 bg-zinc-200 rounded w-3/4" />
            <div className="h-2 bg-zinc-200 rounded w-1/2" />
            <div className="h-px bg-zinc-100 my-2" />
            <div className="h-2 bg-zinc-200 rounded w-full" />
            <div className="h-2 bg-zinc-200 rounded w-full" />
            <div className="h-2 bg-zinc-200 rounded w-2/3" />
            <div className="h-px bg-zinc-100 my-2" />
            <div className="flex justify-between">
              <div className="h-2 bg-zinc-300 rounded w-1/3" />
              <div className="h-2.5 bg-zinc-900 rounded w-1/4" />
            </div>
          </div>
        </motion.div>

        {/* Scan line */}
        <motion.div
          className="absolute left-8 right-8 h-px bg-amber-400/80 shadow-[0_0_8px_2px_rgba(251,191,36,0.4)]"
          initial={{ top: '20%' }}
          animate={{ top: ['20%', '80%', '20%'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

function SlideResult() {
  const feelings = [
    { label: 'Routine', emoji: '🔄', color: 'bg-zinc-100 text-zinc-600' },
    { label: 'Treat', emoji: '🎁', color: 'bg-violet-100 text-violet-700' },
    { label: 'Impulsive', emoji: '⚡', color: 'bg-rose-100 text-rose-600' },
  ]

  return (
    <div className="w-full h-72 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-72 bg-white rounded-2xl p-5 shadow-lg border border-zinc-100"
      >
        {/* Receipt header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-base font-semibold text-zinc-900">Blue Bottle Coffee</div>
            <div className="text-2xl font-black text-zinc-900 mt-0.5 tracking-tight">$18.50</div>
          </div>
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">
            ☕
          </div>
        </div>

        {/* Feeling question */}
        <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-3">
          How did this feel?
        </p>
        <div className="flex gap-2">
          {feelings.map((f, i) => (
            <motion.button
              key={f.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                i === 0 ? 'ring-2 ring-zinc-900 ring-offset-1 ' + f.color : f.color
              )}
            >
              <span>{f.emoji}</span>
              {f.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function SlideTrail() {
  // Fake trail: 4 spending dots connected by a path
  const stops = [
    { x: 48, y: 160, emoji: '☕', amount: '$5', delay: 0.2 },
    { x: 130, y: 90, emoji: '🛒', amount: '$32', delay: 0.5 },
    { x: 210, y: 130, emoji: '🍜', amount: '$18', delay: 0.8 },
    { x: 165, y: 195, emoji: '🍺', amount: '$24', delay: 1.1 },
  ]

  return (
    <div className="w-full h-72 flex items-center justify-center">
      <div className="relative w-72 h-64 bg-zinc-100 rounded-2xl overflow-hidden">
        {/* Map tile texture (fake grid) */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#71717a" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Trail polyline */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <motion.polyline
            points={stops.map((s) => `${s.x},${s.y}`).join(' ')}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeDasharray="6 8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.2, ease: 'easeInOut' }}
          />
        </svg>

        {/* Spending markers */}
        {stops.map((stop) => (
          <motion.div
            key={stop.emoji}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: stop.delay, type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-white rounded-full px-2.5 py-1.5 shadow-md border border-zinc-100 text-xs font-semibold text-zinc-700"
            style={{ left: stop.x, top: stop.y }}
          >
            <span className="text-sm">{stop.emoji}</span>
            {stop.amount}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// --- Slide Data ---

const SLIDES = [
  {
    illustration: <SlideSnap />,
    step: '01',
    title: 'Snap it.',
    description: 'Point your camera at any receipt. We read the vendor, amount, and location — no typing required.',
  },
  {
    illustration: <SlideResult />,
    step: '02',
    title: 'Feel it.',
    description: 'Tag each purchase with how it made you feel. Necessary? Impulsive? Celebrating? Your spending has a mood.',
  },
  {
    illustration: <SlideTrail />,
    step: '03',
    title: 'Trail it.',
    description: 'Every receipt becomes a stop on your map. Follow your spending trail and discover patterns you never knew existed.',
  },
]

// --- Page ---

export default function OnboardingPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const isLast = current === SLIDES.length - 1

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
  }

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('hasSeenOnboarding', 'true')
      router.push('/signup')
    } else {
      goTo(current + 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    router.push('/login')
  }

  const slide = SLIDES[current]

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-8 select-none">
      {/* Top row */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-bold tracking-widest text-zinc-400 tabular-nums uppercase">
          {String(current + 1).padStart(2, '0')} / {SLIDES.length}
        </span>
        <button
          onClick={handleSkip}
          className="text-sm text-zinc-400 font-medium hover:text-zinc-700 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Illustration */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => e.currentTarget.setPointerCapture(e.pointerId)}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_: unknown, info: { offset: { x: number } }) => {
              if (info.offset.x < -50 && current < SLIDES.length - 1) goTo(current + 1)
              else if (info.offset.x > 50 && current > 0) goTo(current - 1)
            }}
            className="w-full"
          >
            {slide.illustration}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="space-y-8 pb-2">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.24, ease: 'easeInOut' }}
            className="space-y-2"
          >
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              {slide.step}
            </p>
            <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight">{slide.title}</h1>
            <p className="text-zinc-500 leading-relaxed text-sm">{slide.description}</p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === current ? 'w-6 bg-zinc-900' : 'w-1.5 bg-zinc-200'
              )}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleNext}
          className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
        >
          {isLast ? (
            <>
              Start your trail
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Login link on last slide */}
        {isLast && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-zinc-400"
          >
            Already have an account?{' '}
            <button onClick={handleSkip} className="text-zinc-900 font-semibold">
              Log in
            </button>
          </motion.p>
        )}
      </div>
    </div>
  )
}
