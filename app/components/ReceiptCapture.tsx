'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  onCapture: (blob: Blob) => Promise<void> | void
  /** 안정화 시간(초) - 기본 1.6초 정도 */
  steadySeconds?: number
  /** 자동 캡처 옵션 기본값 */
  defaultAutoCapture?: boolean
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function captureFrameAsBlob(video: HTMLVideoElement): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to capture'))), 'image/png')
  })
}

/**
 * “Hold steady” 감지: 연속 프레임 간 픽셀 차이(간단한 움직임 지표)를 측정
 * - OpenCV 없이도 가능
 * - 성능 위해 low-res(예: 96x96)로 줄여 비교
 */
class MotionMeter {
  private w = 96
  private h = 96
  private prev: Uint8ClampedArray | null = null
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.w
    this.canvas.height = this.h
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D not supported')
    this.ctx = ctx
  }

  measure(video: HTMLVideoElement): number {
    // 0~1: 0에 가까울수록 안정적
    this.ctx.drawImage(video, 0, 0, this.w, this.h)
    const img = this.ctx.getImageData(0, 0, this.w, this.h).data

    // luminance만 대충 비교 (RGB 모두 쓰면 비용↑)
    const cur = new Uint8ClampedArray(this.w * this.h)
    for (let i = 0, p = 0; i < img.length; i += 4, p++) {
      // 간단히 평균
      cur[p] = (img[i] + img[i + 1] + img[i + 2]) / 3
    }

    if (!this.prev) {
      this.prev = cur
      return 1 // 첫 프레임은 “움직임 많음” 처리
    }

    let diffSum = 0
    for (let i = 0; i < cur.length; i++) diffSum += Math.abs(cur[i] - this.prev[i])
    this.prev = cur

    // diffSum 범위가 기기마다 다르니 0~1로 대충 스케일링
    // 96*96=9216 픽셀. 픽셀당 diff 평균이 2~6 이하면 안정적인 편.
    const avg = diffSum / cur.length
    const motion = clamp01(avg / 12) // 12는 경험적 임계값(튜닝 가능)
    return motion
  }

  reset() {
    this.prev = null
  }
}

export default function ReceiptCapture({
  onCapture,
  steadySeconds = 1.6,
  defaultAutoCapture = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isReady, setIsReady] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(defaultAutoCapture)
  const [cooldownUntil, setCooldownUntil] = useState(0)

  const [motion, setMotion] = useState(1) // 0~1, 낮을수록 안정
  const [steadyProgress, setSteadyProgress] = useState(0) // 0~1
  const [hasUserIntent, setHasUserIntent] = useState(false) // “영수증이 맞다” 대신 유저 의도

  const meterRef = useRef<MotionMeter | null>(null)
  const stableMsRef = useRef(0)
  const lastTRef = useRef<number | null>(null)

  // const isStable = motion < 0.18 // 튜닝 포인트
  const canCapture = useMemo(() => {
    const now = Date.now()
    return isReady && hasUserIntent && steadyProgress >= 1 && now > cooldownUntil
  }, [isReady, hasUserIntent, steadyProgress, cooldownUntil])

  async function startCamera() {
    setError(null)
    setIsStarting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()

      meterRef.current = new MotionMeter()
      stableMsRef.current = 0
      lastTRef.current = null
      setSteadyProgress(0)
      setMotion(1)
      setIsReady(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start camera')
    } finally {
      setIsStarting(false)
    }
  }

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null

    const stream = streamRef.current
    if (stream) stream.getTracks().forEach((t) => t.stop())
    streamRef.current = null

    meterRef.current?.reset()
    meterRef.current = null
    stableMsRef.current = 0
    lastTRef.current = null

    setIsReady(false)
    setSteadyProgress(0)
    setMotion(1)
    setHasUserIntent(false)
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (!isReady) return

    let mounted = true
    const loop = async (t: number) => {
      if (!mounted) return
      const video = videoRef.current
      const meter = meterRef.current
      if (!video || !meter) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      // 250ms 정도로만 측정 (성능/배터리)
      const lastT = lastTRef.current
      const dt = lastT ? t - lastT : 0
      if (!lastT || dt >= 250) {
        lastTRef.current = t

        const m = meter.measure(video)
        setMotion(m)

        if (hasUserIntent && m < 0.18) {
          stableMsRef.current += dt || 250
        } else {
          stableMsRef.current = 0
        }

        const progress = clamp01(stableMsRef.current / (steadySeconds * 1000))
        setSteadyProgress(progress)

        // Auto-capture: “안정 + 유저 의도”만으로 트리거
        if (autoCaptureEnabled && progress >= 1 && Date.now() > cooldownUntil) {
          try {
            const blob = await captureFrameAsBlob(video)
            await onCapture(blob)
            setCooldownUntil(Date.now() + 3500)
            stableMsRef.current = 0
            setSteadyProgress(0)
          } catch {
            setCooldownUntil(Date.now() + 2000)
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      mounted = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [isReady, hasUserIntent, autoCaptureEnabled, cooldownUntil, onCapture, steadySeconds])

  const statusText = !isReady
    ? isStarting
      ? 'Starting camera...'
      : 'Camera is off'
    : !hasUserIntent
    ? 'Align the receipt inside the frame'
    : steadyProgress < 1
    ? `Hold steady… ${Math.round(steadyProgress * 100)}%`
    : 'Ready to capture'

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl overflow-hidden shadow-sm border bg-black relative">
        <video ref={videoRef} className="w-full h-auto block" playsInline muted />

        {/* 가이드 프레임 오버레이 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[78%] aspect-3/5 max-w-[360px]">
              <div
                className={[
                  'absolute inset-0 rounded-2xl border-2',
                  hasUserIntent
                    ? motion < 0.18
                      ? 'border-green-400/90'
                      : 'border-yellow-300/90'
                    : 'border-white/40',
                ].join(' ')}
              />
              {/* 모서리 포인트 느낌 */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-white/70 rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-white/70 rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-white/70 rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-white/70 rounded-br-xl" />
            </div>
          </div>
        </div>

        {/* 상단 상태 */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-3">
          <div className="backdrop-blur bg-white/10 border border-white/15 text-white rounded-xl px-3 py-2 text-sm">
            <div className="font-medium">{statusText}</div>
            <div className="opacity-80 text-xs">Stability: {Math.round((1 - motion) * 100)}%</div>
          </div>

          <label className="backdrop-blur bg-white/10 border border-white/15 text-white rounded-xl px-3 py-2 text-xs flex items-center gap-2 select-none">
            <input
              type="checkbox"
              className="accent-white"
              checked={autoCaptureEnabled}
              onChange={(e) => setAutoCaptureEnabled(e.target.checked)}
            />
            Auto-capture
          </label>
        </div>

        {/* 하단 컨트롤 */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => (isReady ? stopCamera() : startCamera())}
            className="rounded-xl px-4 py-2 text-sm border border-white/20 text-white backdrop-blur bg-white/10 hover:bg-white/15"
          >
            {isReady ? 'Stop' : 'Start'}
          </button>

          {/* 유저 의도(“영수증이 맞아요”) 토글: detection 대신 UX로 해결 */}
          <button
            type="button"
            onClick={() => {
              setHasUserIntent(true)
              stableMsRef.current = 0
              setSteadyProgress(0)
            }}
            disabled={hasUserIntent}
            className={[
              'rounded-xl px-4 py-2 text-sm border backdrop-blur',
              hasUserIntent
                ? 'border-white/10 text-white/60 bg-white/5 cursor-not-allowed'
                : 'border-white/20 text-white bg-white/10 hover:bg-white/15',
            ].join(' ')}
          >
            I’m scanning a receipt
          </button>

          <button
            type="button"
            disabled={!canCapture}
            onClick={async () => {
              const video = videoRef.current
              if (!video) return
              const blob = await captureFrameAsBlob(video)
              await onCapture(blob)
              setCooldownUntil(Date.now() + 3500)
              stableMsRef.current = 0
              setSteadyProgress(0)
            }}
            className={[
              'rounded-full px-6 py-3 text-sm font-semibold shadow-sm border',
              canCapture
                ? 'bg-white text-black border-white/40 hover:bg-white/90'
                : 'bg-white/20 text-white/70 border-white/20 cursor-not-allowed',
            ].join(' ')}
          >
            Capture
          </button>
        </div>

        {error && (
          <div className="absolute inset-x-3 bottom-16 text-xs text-red-100 bg-red-500/20 border border-red-400/30 rounded-xl px-3 py-2 backdrop-blur">
            {error}
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-neutral-600">
        <p>• Align the receipt within the frame and hold your device steady.</p>
      </div>
    </div>
  )
}
