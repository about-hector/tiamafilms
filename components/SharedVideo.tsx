'use client'

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { useVideoElement, useConnectionAware } from '@/contexts/VideoContext'

// Custom hook for intersection observer
function useInView(threshold: number = 0.5) {
  const [isInView, setIsInView] = useState(false)
  const [refCallback, setRefCallback] = useState<HTMLElement | null>(null)

  const ref = useCallback((node: HTMLElement | null) => {
    setRefCallback(node)
  }, [])

  useEffect(() => {
    if (!refCallback) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold }
    )

    observer.observe(refCallback)

    return () => {
      observer.disconnect()
    }
  }, [refCallback, threshold])

  return [ref, isInView] as const
}

export interface SharedVideoProps {
  videoId: string
  startTime?: number
  className?: string
  style?: React.CSSProperties
  autoPlay?: boolean
  playOnInView?: boolean // New prop for intersection observer based autoplay
  muted?: boolean
  loop?: boolean
  controls?: boolean
  isVisible?: boolean
  onLoadStart?: () => void
  onLoadComplete?: () => void
  onError?: (error: string) => void
  onTimeUpdate?: (currentTime: number) => void
  onPlay?: () => void
  onPause?: () => void
}

export interface SharedVideoRef {
  play: () => Promise<void>
  pause: () => void
  setCurrentTime: (time: number) => void
  setPlaybackRate: (rate: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  isPaused: () => boolean
}

export const SharedVideo = forwardRef<SharedVideoRef, SharedVideoProps>(({
  videoId,
  startTime = 0,
  className = '',
  style = {},
  autoPlay = false,
  playOnInView = false,
  muted = true,
  loop = true,
  controls = false,
  isVisible = true,
  onLoadStart,
  onLoadComplete,
  onError,
  onTimeUpdate,
  onPlay,
  onPause
}, ref) => {
  const videoRef = useRef<HTMLDivElement>(null)
  const { shouldReduceData, shouldPreload, canAffordHighQuality } = useConnectionAware()

  // Use intersection observer for playOnInView
  const [inViewRef, isInView] = useInView(0.5)

  // Combine refs
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    videoRef.current = node
    if (playOnInView) {
      inViewRef(node)
    }
  }, [inViewRef, playOnInView])

  // Determine if video should be playing
  const shouldPlay = autoPlay || (playOnInView && isInView)

  const {
    videoElement,
    objectUrl,
    isLoading,
    error,
    play: videoPlay,
    pause: videoPause,
    setTime: videoSetTime,
    setRate: videoSetRate
  } = useVideoElement(videoId, isVisible && shouldPreload)

  // Debug logging for SharedVideo
  useEffect(() => {
    console.log(`[SharedVideo:${videoId}] State - isLoading:`, isLoading, 'error:', error, 'videoElement:', !!videoElement, 'objectUrl:', !!objectUrl)
    console.log(`[SharedVideo:${videoId}] Props - autoPlay:`, autoPlay, 'isVisible:', isVisible, 'shouldPreload:', shouldPreload)
  }, [videoId, isLoading, error, videoElement, objectUrl, autoPlay, isVisible, shouldPreload])

  // Set up video element properties and ref when available
  useEffect(() => {
    if (!videoElement || !videoRef.current) return

    console.log(`[SharedVideo:${videoId}] Setting up video element`)

    // Configure video element properties
    videoElement.className = `w-full h-full object-cover ${className}`.trim()
    Object.assign(videoElement.style, style)

    videoElement.muted = muted
    videoElement.loop = loop
    videoElement.controls = controls
    videoElement.playsInline = true

    // Append to our container
    if (videoRef.current && !videoRef.current.contains(videoElement)) {
      videoRef.current.innerHTML = '' // Clear any existing content
      videoRef.current.appendChild(videoElement)
      console.log(`[SharedVideo:${videoId}] Video element appended to container`)
    }

    return () => {
      // Cleanup when component unmounts or video changes
      if (videoRef.current && videoRef.current.contains(videoElement)) {
        videoRef.current.removeChild(videoElement)
      }
    }
  }, [videoElement, className, style, muted, loop, controls, videoId])

  // Handle loading states and callbacks
  useEffect(() => {
    if (isLoading) {
      onLoadStart?.()
    } else if (videoElement && !error) {
      onLoadComplete?.()
    }
  }, [isLoading, videoElement, error, onLoadStart, onLoadComplete])

  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  // Set up video event listeners
  useEffect(() => {
    if (!videoElement) return

    const handleTimeUpdate = () => {
      onTimeUpdate?.(videoElement.currentTime)
    }

    const handlePlay = () => {
      onPlay?.()
    }

    const handlePause = () => {
      onPause?.()
    }

    videoElement.addEventListener('timeupdate', handleTimeUpdate)
    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('pause', handlePause)

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate)
      videoElement.removeEventListener('play', handlePlay)
      videoElement.removeEventListener('pause', handlePause)
    }
  }, [videoElement, onTimeUpdate, onPlay, onPause])

  // Handle autoplay and start time - more aggressive immediate playback
  useEffect(() => {
    console.log(`[SharedVideo:${videoId}] Autoplay effect - videoElement:`, !!videoElement, 'autoPlay:', autoPlay)
    if (!videoElement) return

    const initializeVideo = async () => {
      console.log(`[SharedVideo:${videoId}] Initializing video - startTime:`, startTime, 'autoPlay:', autoPlay, 'shouldReduceData:', shouldReduceData)
      try {
        // Set start time
        if (startTime > 0) {
          console.log(`[SharedVideo:${videoId}] Setting start time to:`, startTime)
          videoElement.currentTime = startTime
        }

        // More aggressive autoplay - start immediately if shouldPlay is true, regardless of loading state
        if (shouldPlay && isVisible) {
          console.log(`[SharedVideo:${videoId}] Attempting immediate autoplay`)

          // Set up event listener to play as soon as we have enough data
          const handleCanPlay = async () => {
            try {
              await videoElement.play()
              console.log(`[SharedVideo:${videoId}] Autoplay successful`)
            } catch (playError) {
              console.warn(`[SharedVideo:${videoId}] Auto-play failed:`, playError)
            }
            videoElement.removeEventListener('canplay', handleCanPlay)
          }

          // If video is already ready, play immediately
          if (videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            await videoElement.play()
            console.log(`[SharedVideo:${videoId}] Immediate autoplay successful`)
          } else {
            // Otherwise wait for canplay event
            videoElement.addEventListener('canplay', handleCanPlay)

            // Also try to play immediately in case the event already fired
            setTimeout(async () => {
              if (videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && videoElement.paused) {
                try {
                  await videoElement.play()
                  console.log(`[SharedVideo:${videoId}] Delayed autoplay successful`)
                } catch (err) {
                  console.warn(`[SharedVideo:${videoId}] Delayed auto-play failed:`, err)
                }
              }
            }, 50)
          }
        } else {
          console.log(`[SharedVideo:${videoId}] Skipping autoplay - shouldPlay:`, shouldPlay, 'isVisible:', isVisible)
        }
      } catch (playError) {
        console.warn(`[SharedVideo:${videoId}] Auto-play initialization failed:`, playError)
      }
    }

    // Start immediately, no delay
    initializeVideo()
  }, [videoElement, shouldPlay, startTime, videoId, shouldReduceData, isVisible])

  // Handle play/pause based on visibility when playOnInView is enabled
  useEffect(() => {
    if (!videoElement || !playOnInView) return

    if (isInView) {
      if (videoElement.paused) {
        console.log(`[SharedVideo:${videoId}] Playing video due to in-view`)
        videoElement.play().catch(err => {
          console.warn(`[SharedVideo:${videoId}] Play on in-view failed:`, err)
        })
      }
    } else {
      if (!videoElement.paused) {
        console.log(`[SharedVideo:${videoId}] Pausing video due to out-of-view`)
        videoElement.pause()
      }
    }
  }, [videoElement, playOnInView, isInView, videoId])

  // Imperative API for ref
  useImperativeHandle(ref, () => ({
    play: async () => {
      if (videoElement) {
        await videoElement.play()
      } else {
        await videoPlay(startTime)
      }
    },
    pause: () => {
      if (videoElement) {
        videoElement.pause()
      } else {
        videoPause()
      }
    },
    setCurrentTime: (time: number) => {
      if (videoElement) {
        videoElement.currentTime = time
      } else {
        videoSetTime(time)
      }
    },
    setPlaybackRate: (rate: number) => {
      if (videoElement) {
        videoElement.playbackRate = rate
      } else {
        videoSetRate(rate)
      }
    },
    getCurrentTime: () => {
      return videoElement ? videoElement.currentTime : 0
    },
    getDuration: () => {
      return videoElement ? videoElement.duration : 0
    },
    isPaused: () => {
      return videoElement ? videoElement.paused : true
    }
  }), [videoElement, videoPlay, videoPause, videoSetTime, videoSetRate, startTime])

  // Render loading or error states
  if (isLoading) {
    return (
      <div
        className={`relative bg-medium-grey animate-pulse ${className}`}
        style={style}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`relative bg-medium-grey flex items-center justify-center ${className}`}
        style={style}
      >
        <div className="text-center text-dark-grey p-4">
          <div className="w-12 h-12 mx-auto mb-2 opacity-50">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm">Video unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={combinedRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* Video element will be appended here dynamically */}
      {!videoElement && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-medium-grey">
          <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
})

SharedVideo.displayName = 'SharedVideo'

// Connection-aware wrapper that can disable videos on slow connections
export interface AdaptiveVideoProps extends SharedVideoProps {
  fallbackContent?: React.ReactNode
  requiresHighQuality?: boolean
}

export function AdaptiveVideo({
  fallbackContent,
  requiresHighQuality = false,
  ...sharedVideoProps
}: AdaptiveVideoProps) {
  const { shouldReduceData, canAffordHighQuality } = useConnectionAware()

  // Don't show video on very slow connections or if high quality is required but not available
  if (shouldReduceData || (requiresHighQuality && !canAffordHighQuality)) {
    if (fallbackContent) {
      return <>{fallbackContent}</>
    }

    return (
      <div
        className={`relative bg-medium-grey flex items-center justify-center ${sharedVideoProps.className || ''}`}
        style={sharedVideoProps.style}
      >
        <div className="text-center text-dark-grey p-4">
          <div className="w-12 h-12 mx-auto mb-2 opacity-50">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
            </svg>
          </div>
          <p className="text-sm">Video disabled to save data</p>
        </div>
      </div>
    )
  }

  return <SharedVideo {...sharedVideoProps} />
}

export default SharedVideo