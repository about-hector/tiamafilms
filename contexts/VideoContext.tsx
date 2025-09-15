'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { VideoManager } from '@/lib/videoManager'
import { ConnectionInfo } from '@/lib/videoConfig'

interface VideoContextValue {
  // Video management (simplified - direct URLs only)
  getDirectVideoUrl: (videoId: string) => string | null

  // State information
  connectionInfo: ConnectionInfo
}

const VideoContext = createContext<VideoContextValue | null>(null)

export interface VideoProviderProps {
  children: React.ReactNode
  enableAutoPreload?: boolean
  priorityVideoIds?: string[]
}

export function VideoProvider({ children }: VideoProviderProps) {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  })

  // Initialize connection info from VideoManager
  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('[VideoContext] Initializing connection info')
    const connectionInfo = VideoManager.getConnectionInfo()
    console.log('[VideoContext] Initial connection:', connectionInfo)
    setConnectionInfo(connectionInfo)
  }, [])

  const getDirectVideoUrl = useCallback((videoId: string): string | null => {
    if (typeof window === 'undefined') {
      return null
    }

    return VideoManager.getDirectVideoUrl(videoId)
  }, [])

  const contextValue: VideoContextValue = {
    // Video management (simplified - direct URLs only)
    getDirectVideoUrl,

    // State information
    connectionInfo
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

// Hook for getting video URLs only (no DOM element management)
export function useVideoElement(videoId: string, isVisible: boolean = true) {
  const { getDirectVideoUrl } = useVideo()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      setIsLoading(true)
      setError(null)
      console.log(`[useVideoElement:${videoId}] Getting video URL`)

      // Get direct URL - no blob caching needed for immutable assets
      const directUrl = getDirectVideoUrl(videoId)
      if (directUrl) {
        console.log(`[useVideoElement:${videoId}] Using direct URL:`, directUrl)
        setVideoUrl(directUrl)
        setIsLoading(false)
        return
      }

      // No fallback needed - if no direct URL, something is wrong with config
      throw new Error(`No video URL found for ${videoId}`)
    } catch (err) {
      console.error(`[useVideoElement:${videoId}] Error loading video:`, err)
      setError(err instanceof Error ? err.message : 'Failed to load video')
      setVideoUrl(null)
      setIsLoading(false)
    }
  }, [videoId, getDirectVideoUrl])

  return {
    videoUrl,
    isLoading,
    error
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