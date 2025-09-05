'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { VideoManager } from '@/lib/videoManager'
import { ConnectionInfo } from '@/lib/videoConfig'

interface VideoContextValue {
  // Video management
  getVideoObjectUrl: (videoId: string, isVisible?: boolean) => Promise<string | null>
  getDirectVideoUrl: (videoId: string) => string | null
  createVideoElement: (objectUrl: string) => HTMLVideoElement

  // State information
  connectionInfo: ConnectionInfo
  loadedVideos: string[]
  preloadedVideos: string[]
  totalDownloadedSize: number
  isPreloading: boolean

  // Preloading control
  startPreloading: (priorityVideoIds?: string[]) => void

  // Event system
  addEventListener: (callback: (videoId: string, event: string, data?: any) => void) => void
  removeEventListener: (callback: (videoId: string, event: string, data?: any) => void) => void
}

const VideoContext = createContext<VideoContextValue | null>(null)

export interface VideoProviderProps {
  children: React.ReactNode
  enableAutoPreload?: boolean
  priorityVideoIds?: string[]
}

export function VideoProvider({
  children,
  enableAutoPreload = true,
  priorityVideoIds = []
}: VideoProviderProps) {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  })
  const [loadedVideos, setLoadedVideos] = useState<string[]>([])
  const [preloadedVideos, setPreloadedVideos] = useState<string[]>([])
  const [totalDownloadedSize, setTotalDownloadedSize] = useState<number>(0)
  const [isPreloading, setIsPreloading] = useState<boolean>(false)

  const eventCallbacksRef = useRef<Set<(videoId: string, event: string, data?: any) => void>>(new Set())
  const hasStartedPreloading = useRef(false)

  // Internal event handler to update state
  const handleVideoEvent = useCallback((videoId: string, event: string, data?: any) => {
    switch (event) {
      case 'connectionUpdated':
        setConnectionInfo(data)
        break
      case 'preloaded':
        setPreloadedVideos(VideoManager.getPreloadedVideos())
        setTotalDownloadedSize(VideoManager.getTotalDownloadedSize())
        break
      case 'loaded':
        setLoadedVideos(VideoManager.getLoadedVideos())
        setTotalDownloadedSize(VideoManager.getTotalDownloadedSize())
        break
      case 'preloadError':
        // Handle preload errors gracefully
        if (data?.isCorsError) {
          console.warn(`[VideoContext] Blob caching failed for ${videoId} due to CORS. Videos will use direct URLs.`)
        } else {
          console.warn(`[VideoContext] Preload failed for ${videoId}, but video may still work with direct URLs.`)
        }
        break
    }

    // Forward to external callbacks
    eventCallbacksRef.current.forEach(callback => {
      try {
        callback(videoId, event, data)
      } catch (error) {
        console.error('External video event callback error:', error)
      }
    })
  }, [])

  // Initialize video manager and set up event listening
  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('[VideoContext] Setting up VideoManager event listener')
    VideoManager.addEventListener(handleVideoEvent)

    // Initialize state from video manager
    const connectionInfo = VideoManager.getConnectionInfo()
    const loadedVideos = VideoManager.getLoadedVideos()
    const preloadedVideos = VideoManager.getPreloadedVideos()
    const totalSize = VideoManager.getTotalDownloadedSize()

    console.log('[VideoContext] Initial state - connection:', connectionInfo)
    console.log('[VideoContext] Initial state - loaded videos:', loadedVideos)
    console.log('[VideoContext] Initial state - preloaded videos:', preloadedVideos)
    console.log('[VideoContext] Initial state - total size:', totalSize)

    setConnectionInfo(connectionInfo)
    setLoadedVideos(loadedVideos)
    setPreloadedVideos(preloadedVideos)
    setTotalDownloadedSize(totalSize)

    return () => {
      console.log('[VideoContext] Removing VideoManager event listener')
      VideoManager.removeEventListener(handleVideoEvent)
    }
  }, [handleVideoEvent])

  // Auto-start preloading if enabled (temporarily disabled to avoid CORS errors)
  useEffect(() => {
    console.log('[VideoContext] Auto-preload effect - enableAutoPreload:', enableAutoPreload, 'hasStarted:', hasStartedPreloading.current)
    if (enableAutoPreload && !hasStartedPreloading.current) {
      hasStartedPreloading.current = true
      console.log('[VideoContext] Auto-preload temporarily disabled due to CORS issues. Videos will use direct URLs.')

      // Temporarily disable blob preloading to avoid CORS errors
      // Videos will still work with direct URLs
      setIsPreloading(false)

      // TODO: Re-enable once CORS is properly configured
      // VideoManager.initializePreloading(priorityVideoIds)
    }
  }, [enableAutoPreload, priorityVideoIds])

  // Context value methods
  const getVideoObjectUrl = useCallback(async (videoId: string, isVisible: boolean = true): Promise<string | null> => {
    if (typeof window === 'undefined') {
      console.log('[VideoContext] getVideoObjectUrl called on server side, returning null')
      return null
    }

    console.log('[VideoContext] getVideoObjectUrl called for:', videoId, 'isVisible:', isVisible)
    try {
      const objectUrl = await VideoManager.getVideoObjectUrl(videoId, isVisible)
      console.log('[VideoContext] getVideoObjectUrl result for', videoId, ':', objectUrl ? 'URL found' : 'null')
      return objectUrl
    } catch (error) {
      console.error('[VideoContext] Error in getVideoObjectUrl for', videoId, ':', error)
      return null
    }
  }, [])

  const getDirectVideoUrl = useCallback((videoId: string): string | null => {
    if (typeof window === 'undefined') {
      return null
    }

    return VideoManager.getDirectVideoUrl(videoId)
  }, [])

  const createVideoElement = useCallback((objectUrl: string): HTMLVideoElement => {
    if (typeof window === 'undefined') {
      throw new Error('createVideoElement called on server side')
    }

    return VideoManager.createVideoElement(objectUrl)
  }, [])

  const startPreloading = useCallback((priorityIds?: string[]): void => {
    setIsPreloading(true)
    VideoManager.initializePreloading(priorityIds || priorityVideoIds)
  }, [priorityVideoIds])

  const addEventListener = useCallback((callback: (videoId: string, event: string, data?: any) => void): void => {
    eventCallbacksRef.current.add(callback)
  }, [])

  const removeEventListener = useCallback((callback: (videoId: string, event: string, data?: any) => void): void => {
    eventCallbacksRef.current.delete(callback)
  }, [])

  const contextValue: VideoContextValue = {
    // Video management with blob URLs
    getVideoObjectUrl,
    getDirectVideoUrl,
    createVideoElement,

    // State information
    connectionInfo,
    loadedVideos,
    preloadedVideos,
    totalDownloadedSize,
    isPreloading,

    // Preloading control
    startPreloading,

    // Event system
    addEventListener,
    removeEventListener
  }

  return (
    <VideoContext.Provider value={contextValue}>
      {children}
    </VideoContext.Provider>
  )
}

// Hook to use video context
export function useVideo() {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider')
  }
  return context
}

// Hook for individual video management using direct URLs for immediate playback
export function useVideoElement(videoId: string, isVisible: boolean = true) {
  const { getVideoObjectUrl, getDirectVideoUrl, createVideoElement } = useVideo()
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadVideoElement = useCallback(async () => {
    if (typeof window === 'undefined') return

    try {
      setIsLoading(true)
      setError(null)
      console.log(`[useVideoElement:${videoId}] Loading video element`)

      // First try to get direct URL for immediate playback
      const directUrl = getDirectVideoUrl(videoId)
      if (directUrl) {
        console.log(`[useVideoElement:${videoId}] Using direct URL for immediate playback`)
        const element = document.createElement('video')
        element.src = directUrl
        element.preload = 'metadata'
        element.muted = true
        element.playsInline = true
        element.loop = true

        // Mobile-specific attributes for immediate playback
        element.setAttribute('webkit-playsinline', 'true')
        element.setAttribute('playsinline', 'true')
        element.setAttribute('muted', 'true')

        // iOS Safari specific optimizations
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          element.setAttribute('x-webkit-airplay', 'allow')
          element.crossOrigin = 'anonymous'
        }

        setVideoElement(element)
        setObjectUrl(directUrl)
        setIsLoading(false)

        // Start background blob caching for optimized future playback
        getVideoObjectUrl(videoId, isVisible).then(blobUrl => {
          if (blobUrl && element.src !== blobUrl) {
            console.log(`[useVideoElement:${videoId}] Upgrading to blob URL for optimized playback`)
            element.src = blobUrl
            setObjectUrl(blobUrl)
          }
        }).catch(err => {
          console.warn(`[useVideoElement:${videoId}] Blob caching failed:`, err)
        })

        return
      }

      // Fallback to blob URL method
      const url = await getVideoObjectUrl(videoId, isVisible)

      if (url) {
        console.log(`[useVideoElement:${videoId}] Got object URL, creating element`)
        const element = createVideoElement(url)
        setVideoElement(element)
        setObjectUrl(url)
      } else {
        console.log(`[useVideoElement:${videoId}] No URL available yet`)
        setVideoElement(null)
        setObjectUrl(null)
      }
    } catch (err) {
      console.error(`[useVideoElement:${videoId}] Error loading video:`, err)
      setError(err instanceof Error ? err.message : 'Failed to load video')
      setVideoElement(null)
      setObjectUrl(null)
    } finally {
      setIsLoading(false)
    }
  }, [getVideoObjectUrl, getDirectVideoUrl, createVideoElement, videoId, isVisible])

  useEffect(() => {
    loadVideoElement()
  }, [loadVideoElement])

  // Individual video elements handle their own playback control
  const play = useCallback(async (startTime?: number) => {
    if (videoElement) {
      if (startTime !== undefined) {
        videoElement.currentTime = startTime
      }
      await videoElement.play()
    }
  }, [videoElement])

  const pause = useCallback(() => {
    if (videoElement) {
      videoElement.pause()
    }
  }, [videoElement])

  const setTime = useCallback((time: number) => {
    if (videoElement) {
      videoElement.currentTime = time
    }
  }, [videoElement])

  const setRate = useCallback((rate: number) => {
    if (videoElement) {
      videoElement.playbackRate = rate
    }
  }, [videoElement])

  return {
    videoElement,
    objectUrl,
    isLoading,
    error,
    play,
    pause,
    setTime,
    setRate,
    reload: loadVideoElement
  }
}

// Hook for connection-aware features
export function useConnectionAware() {
  const { connectionInfo } = useVideo()

  const isSlow = connectionInfo.effectiveType === 'slow-2g' || connectionInfo.effectiveType === '2g'
  const isFast = connectionInfo.effectiveType === '4g' && connectionInfo.downlink >= 5
  const shouldReduceData = connectionInfo.saveData || isSlow
  const shouldPreload = !shouldReduceData && connectionInfo.downlink >= 2

  return {
    connectionInfo,
    isSlow,
    isFast,
    shouldReduceData,
    shouldPreload,
    canAffordHighQuality: isFast && !connectionInfo.saveData
  }
}