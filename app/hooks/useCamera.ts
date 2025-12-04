'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export async function capturePhoto(videoRef: HTMLVideoElement): Promise<Blob | null> {
  // Canvas 방식을 사용 (화면에 보이는 그대로 캡처)
  const canvas = document.createElement('canvas')

  // 비디오의 실제 렌더링 크기 가져오기
  const displayWidth = videoRef.clientWidth
  const displayHeight = videoRef.clientHeight

  canvas.width = displayWidth
  canvas.height = displayHeight

  const context = canvas.getContext('2d')
  if (context) {
    // object-cover 효과 재현
    const videoWidth = videoRef.videoWidth
    const videoHeight = videoRef.videoHeight
    const videoAspect = videoWidth / videoHeight
    const canvasAspect = displayWidth / displayHeight

    let sx = 0,
      sy = 0,
      sWidth = videoWidth,
      sHeight = videoHeight

    if (videoAspect > canvasAspect) {
      // 비디오가 더 넓음 - 좌우 잘림
      sWidth = videoHeight * canvasAspect
      sx = (videoWidth - sWidth) / 2
    } else {
      // 비디오가 더 높음 - 상하 잘림
      sHeight = videoWidth / canvasAspect
      sy = (videoHeight - sHeight) / 2
    }

    context.drawImage(
      videoRef,
      sx,
      sy,
      sWidth,
      sHeight, // 소스 영역
      0,
      0,
      displayWidth,
      displayHeight // 대상 영역
    )

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95)
    })
  }
  return null
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [showRetake, setShowRetake] = useState(false)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        setStream(mediaStream)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error accessing camera')
    }
  }

  const resetPhoto = () => {
    setPhoto(null)
    setShowRetake(false)
  }

  const takePhoto = useCallback(async () => {
    if (!videoRef.current || !stream) return
    const blob = await capturePhoto(videoRef.current)
    if (blob) {
      const url = URL.createObjectURL(blob)
      setPhoto(url)
      setShowRetake(true)
    }
  }, [stream, videoRef])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return {
    videoRef,
    stream,
    error,
    startCamera,
    takePhoto,
    resetPhoto,
    photo,
    showRetake,
  }
}
