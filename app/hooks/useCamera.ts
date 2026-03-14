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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [showRetake, setShowRetake] = useState(false)

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('카메라에 접근할 수 없습니다. HTTPS 환경에서 접속해주세요.')
      return
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('카메라 권한이 거부됐습니다. 브라우저 설정에서 허용해주세요.')
      } else {
        setError(err instanceof Error ? err.message : '카메라를 시작할 수 없습니다.')
      }
    }
  }

  const resetPhoto = () => {
    setPhotoUrl(null)
    setPhotoBlob(null)
    setShowRetake(false)
  }

  const takePhoto = useCallback(async () => {
    if (!videoRef.current || !stream) return
    const blob = await capturePhoto(videoRef.current)
    if (blob) {
      const url = URL.createObjectURL(blob)
      setPhotoUrl(url)
      setPhotoBlob(blob)
      setShowRetake(true)
    }
  }, [stream, videoRef])

  // Retake 후 video 엘리먼트가 재마운트되면 stream 재연결
  useEffect(() => {
    if (!photoUrl && stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [photoUrl, stream])

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
    photoUrl,
    photoBlob,
    showRetake,
  }
}
