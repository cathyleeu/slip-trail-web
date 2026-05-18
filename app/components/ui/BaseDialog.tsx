'use client'

import { cn } from '@utils/cn'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'

export type BaseDialogProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  /** Extra classes applied to the inner panel wrapper */
  panelClassName?: string
  /** Set false to prevent closing when clicking the backdrop */
  closeOnBackdropClick?: boolean
}

/**
 * Shared modal foundation: animated backdrop + centred panel.
 * Use this for any dialog/modal rather than duplicating backdrop logic.
 *
 * Usage:
 *   <BaseDialog isOpen={open} onClose={handleClose}>
 *     <div className="bg-surface rounded-2xl p-6">...</div>
 *   </BaseDialog>
 */
export function BaseDialog({
  isOpen,
  onClose,
  children,
  panelClassName,
  closeOnBackdropClick = true,
}: BaseDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeOnBackdropClick ? onClose : undefined}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className={cn('w-full max-w-sm mx-4', panelClassName)}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
