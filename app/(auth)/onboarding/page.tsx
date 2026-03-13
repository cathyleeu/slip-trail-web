'use client'

import { Camera, ChevronRight, LocationPinFilled } from '@components/ui/icons'
import { cn } from '@utils/cn'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// --- Slide Illustrations ---

function SlideSnap() {
  return (
    <div className="w-full h-72 flex items-center justify-center">
      <div className="relative w-64 h-64 bg-gray-900 rounded-3xl flex items-center justify-center overflow-hidden">
        {/* Corner marks */}
        {[
          'top-5 left-5 border-t-2 border-l-2',
          'top-5 right-5 border-t-2 border-r-2',
          'bottom-5 left-5 border-b-2 border-l-2',
          'bottom-5 right-5 border-b-2 border-r-2',
        ].map((cls, i) => (
          <div key={i} className={cn('absolute w-5 h-5 border-white', cls)} />
        ))}

        {/* Receipt mockup */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          className="w-32 bg-white rounded-xl p-3 shadow-2xl"
        >
          <div className="space-y-1.5">
            <div className="h-2 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-1/2" />
            <div className="h-px bg-gray-100 my-2" />
            <div className="h-2 bg-gray-200 rounded w-full" />
            <div className="h-2 bg-gray-200 rounded w-full" />
            <div className="h-2 bg-gray-200 rounded w-2/3" />
            <div className="h-px bg-gray-100 my-2" />
            <div className="flex justify-between">
              <div className="h-2 bg-gray-300 rounded w-1/3" />
              <div className="h-2 bg-gray-900 rounded w-1/4" />
            </div>
          </div>
        </motion.div>

        {/* Scan line */}
        <motion.div
          className="absolute left-8 right-8 h-px bg-white/60 shadow-[0_0_8px_2px_rgba(255,255,255,0.4)]"
          initial={{ top: '20%' }}
          animate={{ top: ['20%', '80%', '20%'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Camera icon */}
        <div className="absolute bottom-4 right-4">
          <Camera className="w-5 h-5 text-white/40" />
        </div>
      </div>
    </div>
  )
}

function SlideResult() {
  return (
    <div className="w-full h-72 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-72 bg-white rounded-2xl p-5 shadow-lg border border-gray-100"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-base font-semibold text-gray-900">Blue Bottle Coffee</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">$18.50</div>
          </div>
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">
            ☕
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            Food & Drink
          </span>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full flex items-center gap-1">
            <LocationPinFilled className="w-3 h-3" />
            Oakland
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
          <span>Mar 13, 2026</span>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 400 }}
            className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center"
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function SlideDashboard() {
  return (
    <div className="w-full h-72 flex items-center justify-center">
      <div className="w-72 space-y-3">
        {/* Summary card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">This week</div>
              <div className="text-2xl font-bold text-gray-900">$124.50</div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-semibold text-gray-900">8</span> receipts
              </div>
            </div>
            <div className="text-xs font-medium bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">
              Month
            </div>
          </div>
        </motion.div>

        {/* Category bar chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100"
        >
          <div className="text-xs font-medium text-gray-500 mb-3">By category</div>
          <div className="space-y-2">
            {[
              { label: 'Food & Drink', pct: 72, amt: '$89.50' },
              { label: 'Transport', pct: 18, amt: '$22.00' },
              { label: 'Shopping', pct: 10, amt: '$13.00' },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-xs text-gray-500 w-20 shrink-0">{row.label}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gray-900 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="text-xs text-gray-400 w-12 text-right shrink-0">{row.amt}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// --- Slide Data ---

const SLIDES = [
  {
    illustration: <SlideSnap />,
    step: '01',
    title: 'Snap your receipt',
    description: 'Take a photo or upload from your gallery. Works with any receipt.',
  },
  {
    illustration: <SlideResult />,
    step: '02',
    title: 'Instant spending card',
    description: 'AI reads the amount, category, and location automatically. No manual entry.',
  },
  {
    illustration: <SlideDashboard />,
    step: '03',
    title: 'See where it all goes',
    description: 'Track weekly and monthly patterns by category. Your finances, visualized.',
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
    <div className="flex flex-col min-h-screen bg-gray-50 px-6 py-8 select-none">
      {/* Top row: step counter + skip */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-gray-400 tabular-nums">
          {current + 1} / {SLIDES.length}
        </span>
        <button
          onClick={handleSkip}
          className="text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Illustration */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
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
            onDragEnd={(_, info) => {
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
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              {slide.step}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{slide.title}</h1>
            <p className="text-gray-500 leading-relaxed text-sm">{slide.description}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === current ? 'w-6 bg-gray-900' : 'w-1.5 bg-gray-300'
              )}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleNext}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          {isLast ? (
            <>
              Get Started
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
            className="text-center text-sm text-gray-400"
          >
            Already have an account?{' '}
            <button onClick={handleSkip} className="text-gray-900 font-medium">
              Log in
            </button>
          </motion.p>
        )}
      </div>
    </div>
  )
}
