'use client'

import { BaseDialog, Button } from '@components/ui'
import { motion } from 'motion/react'
import Image from 'next/image'

type ProcessingDialogProps = {
  isOpen: boolean
  imageUrl: string | null
  progress: number
  stage: string
  onCancel?: () => void
}

export function ProcessingDialog({ isOpen, imageUrl, progress, stage, onCancel }: ProcessingDialogProps) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={() => {}}
      closeOnBackdropClick={false}
      panelClassName="max-w-md"
    >
      <div className="bg-surface-raised rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 space-y-6">
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

          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-fg mb-1">Extracting details</h2>
              <p className="text-fg-muted text-sm">{stage}</p>
            </div>

            <div className="w-full h-2 bg-surface-medium rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="text-center text-sm font-semibold text-fg-muted tabular-nums">
              {progress}%
            </div>

            {onCancel && (
              <Button variant="ghost" onClick={onCancel} className="w-full">
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </BaseDialog>
  )
}
