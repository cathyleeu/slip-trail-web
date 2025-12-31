'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const onboardingSlides = [
  {
    title: 'Smart Spending Map',
    description:
      "Snap a photo of your receipt. We'll organize your expenses and remember exactly where you were.",
    image: (
      <div className="relative w-full h-80 flex items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-teal-600 to-teal-800 rounded-3xl overflow-hidden">
          {/* 3D Map Illustration */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-48 perspective-1000">
              {/* Map Base */}
              <div className="absolute inset-0 bg-white/20 rounded-lg transform rotate-x-60 shadow-2xl">
                {/* Map Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-4 gap-2 p-4 opacity-30">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white/40 rounded" />
                  ))}
                </div>
              </div>

              {/* Location Pins */}
              <div className="absolute top-8 left-12 transform -translate-y-full">
                <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="w-0.5 h-12 bg-orange-400/60 mx-auto" />
              </div>

              <div className="absolute top-12 right-16 transform -translate-y-full">
                <div className="w-6 h-6 bg-orange-300 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="w-0.5 h-8 bg-orange-300/60 mx-auto" />
              </div>

              {/* Bar Chart */}
              <div className="absolute top-16 right-8 flex items-end gap-1 h-16">
                <div className="w-3 bg-orange-400 rounded-t" style={{ height: '40%' }} />
                <div className="w-3 bg-orange-500 rounded-t" style={{ height: '70%' }} />
                <div className="w-3 bg-orange-400 rounded-t" style={{ height: '90%' }} />
                <div className="w-3 bg-orange-300 rounded-t" style={{ height: '60%' }} />
              </div>

              {/* Price Badge */}
              <div className="absolute bottom-4 right-4 bg-white rounded-full px-4 py-2 shadow-xl flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="text-sm font-bold text-gray-800">
                  <div className="text-xs text-gray-500">SAVED</div>
                  <div className="text-base">$124.50</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentSlide] = useState(0)

  const handleSkip = () => {
    router.push('/login')
  }

  const handleGetStarted = () => {
    router.push('/signup')
  }

  const slide = onboardingSlides[currentSlide]

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-8">
      {/* Skip Button */}
      <div className="flex justify-end mb-8">
        <button onClick={handleSkip} className="text-gray-600 font-medium">
          Skip
        </button>
      </div>

      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center mb-8"
      >
        {slide.image}
      </motion.div>

      {/* Content */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl font-bold text-gray-900">{slide.title}</h1>
          <p className="text-gray-600 leading-relaxed">{slide.description}</p>
        </motion.div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 py-4">
          {onboardingSlides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Get Started Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleGetStarted}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Get Started
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}
