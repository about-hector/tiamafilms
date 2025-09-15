'use client'

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { useVideoElement, useConnectionAware } from '@/contexts/VideoContext'
import { VIDEO_CONFIGS, getPosterUrl, isMobileDevice } from '@/lib/videoConfig'

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
  showPoster?: boolean // Show poster/thumbnail while loading
  hidePlayButton?: boolean // Hide the play button (for hero videos)
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
  showPoster = false,
  hidePlayButton = false,
  onLoadStart,
  onLoadComplete,
  onError,
  onTimeUpdate,
  onPlay,
  onPause
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { shouldPreload } = useConnectionAware()
  const [showPlayButton, setShowPlayButton] = useState(false)
  const [showThumbnail, setShowThumbnail] = useState(showPoster)
  const [isMobile, setIsMobile] = useState(false)

  // Use intersection observer for playOnInView
  const [inViewRef, isInView] = useInView(0.5)

  // Combine refs
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
    if (playOnInView) {
      inViewRef(node)
    }
  }, [inViewRef, playOnInView])

  // Detect mobile device on mount
  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  // Get video config and poster URL
  const videoConfig = VIDEO_CONFIGS.find(config => config.id === videoId)
  const posterUrl = videoConfig ? getPosterUrl(videoConfig, isMobile) : null

  // Determine if video should be playing
  const shouldPlay = autoPlay || (playOnInView && isInView)

  const {
    videoUrl,
    isLoading,
    error
  } = useVideoElement(videoId, isVisible && shouldPreload)

  const videoRef = useRef<HTMLVideoElement>(null)

  // Debug logging for SharedVideo
  useEffect(() => {
    console.log(`[SharedVideo:${videoId}] State - isLoading:`, isLoading, 'error:', error, 'videoUrl:', !!videoUrl)
    console.log(`[SharedVideo:${videoId}] Props - autoPlay:`, autoPlay, 'isVisible:', isVisible, 'shouldPreload:', shouldPreload)
  }, [videoId, isLoading, error, videoUrl, autoPlay, isVisible, shouldPreload])

  // Handle loading states and callbacks
  useEffect(() => {
    if (isLoading) {
      onLoadStart?.()
    } else if (videoUrl && !error) {
      onLoadComplete?.()
    }
  }, [isLoading, videoUrl, error, onLoadStart, onLoadComplete])

  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  // Set up video event listeners
  useEffect(() => {
    const videoElement = videoRef.current
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
  }, [onTimeUpdate, onPlay, onPause])


  // Handle autoplay and start time - simplified approach
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !shouldPlay || !isVisible || !videoUrl) return

    let isMounted = true
    const controller = new AbortController()

    const initializeVideo = async () => {
      try {
        console.log(`[SharedVideo:${videoId}] Initializing autoplay - startTime:`, startTime)

        // Set start time immediately
        videoElement.currentTime = startTime

        // Ensure proper settings for autoplay - reapply mobile attributes
        videoElement.muted = true
        videoElement.playsInline = true
        videoElement.setAttribute('webkit-playsinline', 'true')
        videoElement.setAttribute('playsinline', 'true')
        videoElement.setAttribute('muted', 'true')
        if (autoPlay) {
          videoElement.setAttribute('autoplay', 'true')
        }

        // Simple autoplay attempt
        const playVideo = async () => {
          if (!isMounted) return

          try {
            await videoElement.play()
            console.log(`[SharedVideo:${videoId}] Autoplay successful`)
            if (isMounted) {
              setShowPlayButton(false)
              setShowThumbnail(false)
            }
          } catch (playError) {
            console.warn(`[SharedVideo:${videoId}] Autoplay failed:`, playError)
            if (isMounted && !hidePlayButton) {
              setShowPlayButton(true)
            }
          }
        }

        // Try to play immediately if ready
        if (videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          await playVideo()
        } else {
          // Wait for video to be ready
          const handleCanPlay = () => {
            if (!controller.signal.aborted) {
              playVideo()
            }
          }

          videoElement.addEventListener('canplay', handleCanPlay, {
            signal: controller.signal,
            once: true
          })
        }

      } catch (error) {
        console.warn(`[SharedVideo:${videoId}] Video initialization failed:`, error)
      }
    }

    // Start initialization after a brief delay
    const timeout = setTimeout(initializeVideo, 100)

    return () => {
      isMounted = false
      controller.abort()
      clearTimeout(timeout)
    }
  }, [shouldPlay, startTime, videoId, isVisible, hidePlayButton, videoUrl])

  // Handle play/pause based on visibility when playOnInView is enabled
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !playOnInView) return

    if (isInView) {
      // Reapply mobile attributes when video comes into view (in case they were lost)
      videoElement.setAttribute('webkit-playsinline', 'true')
      videoElement.setAttribute('playsinline', 'true')
      videoElement.setAttribute('muted', 'true')
      videoElement.muted = true
      videoElement.playsInline = true

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
  }, [playOnInView, isInView, videoId])

  // Imperative API for ref
  useImperativeHandle(ref, () => ({
    play: async () => {
      const videoElement = videoRef.current
      if (videoElement) {
        await videoElement.play()
      }
    },
    pause: () => {
      const videoElement = videoRef.current
      if (videoElement) {
        videoElement.pause()
      }
    },
    setCurrentTime: (time: number) => {
      const videoElement = videoRef.current
      if (videoElement) {
        videoElement.currentTime = time
      }
    },
    setPlaybackRate: (rate: number) => {
      const videoElement = videoRef.current
      if (videoElement) {
        videoElement.playbackRate = rate
      }
    },
    getCurrentTime: () => {
      const videoElement = videoRef.current
      return videoElement ? videoElement.currentTime : 0
    },
    getDuration: () => {
      const videoElement = videoRef.current
      return videoElement ? videoElement.duration : 0
    },
    isPaused: () => {
      const videoElement = videoRef.current
      return videoElement ? videoElement.paused : true
    }
  }), [startTime])

  // No longer need dynamic poster generation since we have static poster/thumbnail URLs

  // Handle user interaction to play video when autoplay fails
  const handleUserPlay = useCallback(async () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    try {
      setShowPlayButton(false)
      setShowThumbnail(false) // Hide thumbnail when playing
      await videoElement.play()
      console.log(`[SharedVideo:${videoId}] User-initiated play successful`)
    } catch (error) {
      console.error(`[SharedVideo:${videoId}] User play failed:`, error)
      setShowPlayButton(true) // Show button again if play still fails
    }
  }, [videoId])

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
      {/* Native React video element */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline={true}
          preload="metadata"
          webkit-playsinline="true"
          autoPlay={false} // Let our effects handle autoplay
        />
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-medium-grey">
          <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
        </div>
      )}

      {/* Poster/thumbnail overlay */}
      {showThumbnail && posterUrl && (
        <div className="absolute inset-0 z-5">
          <img
            src={posterUrl}
            alt={`${videoId} thumbnail`}
            className="w-full h-full object-cover"
            style={{ transition: 'opacity 0.3s ease-in-out' }}
          />
        </div>
      )}

      {/* Play button overlay for when autoplay fails on mobile */}
      {showPlayButton && videoUrl && !hidePlayButton && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <button
            onClick={handleUserPlay}
            className="flex items-center justify-center w-16 h-16 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Play video"
          >
            <svg
              className="w-6 h-6 ml-1 text-charcoal"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
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