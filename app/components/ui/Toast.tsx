'use client'

import { cn } from '@utils/cn'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

type ToastType = 'success' | 'error'

type ToastProps = {
  message: string
  type: ToastType
  visible: boolean
}

export function Toast({ message, type, visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            'fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg whitespace-nowrap',
            type === 'success' ? 'bg-zinc-900 text-white' : 'bg-rose-500 text-white'
          )}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function useToast() {
  const [toastState, setToastState] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = (message: string, type: ToastType) => {
    setToastState({ message, type })
    setTimeout(() => setToastState(null), 3000)
  }

  return { toastState, showToast }
}
