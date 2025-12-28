'use client'

import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'

type ProcessingDialogProps = {
  isOpen: boolean
  imageUrl: string | null
  progress: number
  stage: string
}

export function ProcessingDialog({ isOpen, imageUrl, progress, stage }: ProcessingDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md mx-4 bg-linear-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Image Preview */}
              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full aspect-3/4 rounded-2xl overflow-hidden shadow-xl"
                >
                  <Image src={imageUrl} alt="Receipt" fill className="object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                </motion.div>
              )}

              {/* Progress Section */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Extracting details</h2>
                  <p className="text-gray-600 text-sm">{stage}</p>
                </motion.div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-linear-to-r from-blue-500 to-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Percentage */}
                <div className="text-center text-sm font-medium text-gray-700">{progress}%</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
