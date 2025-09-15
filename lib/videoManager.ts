'use client'

import { VIDEO_CONFIGS, VideoConfig, QualityLevel, getOptimalQuality, ConnectionInfo, getOptimalVideoUrl, isMobileDevice } from './videoConfig'

export interface VideoCache {
  id: string
  blob: Blob | null
  objectUrl: string | null
  config: VideoConfig
  currentQuality: QualityLevel
  isLoading: boolean
  isLoaded: boolean
  loadPromise: Promise<void> | null
  fileSize: number
  lastUsed: number
}

export interface VideoState {
  isVisible: boolean
  currentTime: number
  isPlaying: boolean
  startTime?: number
}

type VideoEventCallback = (videoId: string, event: string, data?: unknown) => void

class VideoManagerClass {
  private cache: Map<string, VideoCache> = new Map()
  private connectionInfo: ConnectionInfo = {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  }
  private preloadQueue: string[] = []
  private isPreloading = false
  private maxConcurrentLoads = 2
  private maxCacheSize = 5
  private eventCallbacks: VideoEventCallback[] = []

  constructor() {
    console.log('[VideoManager] Initializing VideoManager')
    if (typeof window !== 'undefined') {
      console.log('[VideoManager] Window is available, setting up connection monitoring')
      this.initializeConnectionMonitoring()
      // Don't automatically start preloading in constructor
      // Let VideoContext handle preloading initialization
    } else {
      console.log('[VideoManager] Running on server side, skipping browser-specific initialization')
    }
  }

  // Connection monitoring
  private initializeConnectionMonitoring() {
    console.log('[VideoManager] Initializing connection monitoring')
    try {
      // @ts-expect-error - navigator.connection is not in TypeScript types but exists
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

      if (connection) {
        console.log('[VideoManager] Navigator connection API available')
        const updateConnection = () => {
          this.connectionInfo = {
            effectiveType: connection.effectiveType || '4g',
            downlink: connection.downlink || 10,
            rtt: connection.rtt || 50,
            saveData: connection.saveData || false
          }
          console.log('[VideoManager] Connection updated:', this.connectionInfo)
          this.onConnectionChange()
        }

        updateConnection()
        connection.addEventListener('change', updateConnection)
      } else {
        console.log('[VideoManager] Navigator connection API not available, using defaults')
      }

      // Listen for save-data preference changes
      if ('matchMedia' in window) {
        const mediaQuery = window.matchMedia('(prefers-reduced-data: reduce)')
        mediaQuery.addEventListener('change', (e) => {
          this.connectionInfo.saveData = e.matches
          console.log('[VideoManager] Save data preference changed:', e.matches)
          this.onConnectionChange()
        })
        this.connectionInfo.saveData = mediaQuery.matches
        console.log('[VideoManager] Initial save data preference:', this.connectionInfo.saveData)
      }
    } catch (error) {
      console.error('[VideoManager] Error initializing connection monitoring:', error)
    }
  }

  private onConnectionChange() {
    // With blob caching, we don't need to reassess quality on connection change
    // since we're already downloading the optimal quality once
    this.emitEvent('connectionChange', 'connectionUpdated', this.connectionInfo)
  }

  // Preload management
  public initializePreloading(priorityVideoIds: string[] = []) {
    console.log('[VideoManager] Initializing preloading with priority videos:', priorityVideoIds)
    this.preloadQueue = [...priorityVideoIds]

    // Add remaining videos to queue
    VIDEO_CONFIGS.forEach(config => {
      if (!this.preloadQueue.includes(config.id)) {
        this.preloadQueue.push(config.id)
      }
    })

    console.log('[VideoManager] Full preload queue:', this.preloadQueue)
    this.startPreloading()
  }

  private startPreloading() {
    if (this.isPreloading || this.preloadQueue.length === 0) {
      console.log('[VideoManager] Skipping preloading - already preloading:', this.isPreloading, 'or empty queue:', this.preloadQueue.length === 0)
      return
    }

    console.log('[VideoManager] Starting preloading process')
    this.isPreloading = true
    this.processPreloadQueue()
  }

  private async processPreloadQueue() {
    const concurrent: Promise<void>[] = []

    while (this.preloadQueue.length > 0 && concurrent.length < this.maxConcurrentLoads) {
      const videoId = this.preloadQueue.shift()!
      const promise = this.preloadVideo(videoId)
      concurrent.push(promise)

      // Don't wait for completion, start next immediately
      promise.finally(() => {
        const index = concurrent.indexOf(promise)
        if (index > -1) concurrent.splice(index, 1)

        // Continue processing if there are more videos
        if (this.preloadQueue.length > 0) {
          this.processPreloadQueue()
        } else if (concurrent.length === 0) {
          this.isPreloading = false
        }
      })
    }

    // Wait for at least one to complete before continuing
    if (concurrent.length > 0) {
      await Promise.race(concurrent)
    }
  }

  private async preloadVideo(videoId: string): Promise<void> {
    console.log('[VideoManager] Starting blob preload for video:', videoId)
    const config = VIDEO_CONFIGS.find(c => c.id === videoId)
    if (!config) {
      console.error('[VideoManager] No config found for video:', videoId)
      return
    }

    try {
      // Check if already cached
      const existing = this.cache.get(videoId)
      if (existing && existing.isLoaded && existing.blob) {
        console.log('[VideoManager] Video already cached:', videoId)
        return
      }

      const optimalQuality = getOptimalQuality(
        this.connectionInfo,
        false, // Not necessarily visible during preload
        window.devicePixelRatio,
        isMobileDevice()
      )

      const videoUrl = getOptimalVideoUrl(config, optimalQuality)
      console.log('[VideoManager] Downloading video blob for', videoId)
      console.log('[VideoManager] Video URL:', videoUrl)

      // Create or update cache entry
      const cacheEntry: VideoCache = existing || {
        id: videoId,
        blob: null,
        objectUrl: null,
        config,
        currentQuality: optimalQuality,
        isLoading: true,
        isLoaded: false,
        loadPromise: null,
        fileSize: config.qualities[optimalQuality].fileSize,
        lastUsed: Date.now()
      }

      if (!existing) {
        this.cache.set(videoId, cacheEntry)
      }

      // Create download promise
      const loadPromise = this.downloadVideoBlob(videoUrl).then(blob => {
        cacheEntry.blob = blob
        cacheEntry.objectUrl = URL.createObjectURL(blob)
        cacheEntry.isLoading = false
        cacheEntry.isLoaded = true
      })
      cacheEntry.loadPromise = loadPromise

      await loadPromise

      console.log('[VideoManager] Video blob successfully cached:', videoId, 'Size:', cacheEntry.blob?.size, 'bytes')

      this.emitEvent(videoId, 'preloaded', { quality: optimalQuality, size: cacheEntry.blob?.size || 0 })
      this.manageCacheSize()

    } catch (error) {
      console.error('[VideoManager] Video blob download failed for', videoId, ':', error)

      // Check if this is a CORS error
      const isCorsError = error instanceof TypeError && error.message.includes('Failed to fetch')
      if (isCorsError) {
        console.warn('[VideoManager] CORS error detected. Videos will still work with direct URLs but blob caching is disabled.')
        console.warn('[VideoManager] Please check your Cloudflare R2 CORS configuration.')
      }

      const cacheEntry = this.cache.get(videoId)
      if (cacheEntry) {
        cacheEntry.isLoading = false
        // Don't set as failed, just keep it as not loaded so direct URLs can still work
      }

      this.emitEvent(videoId, 'preloadError', {
        error,
        videoId,
        isCorsError,
        fallbackAvailable: true
      })
    }
  }

  private async downloadVideoBlob(url: string): Promise<Blob> {
    console.log('[VideoManager] Starting fetch for:', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      console.log('[VideoManager] Content-Type:', contentType)

      if (!contentType || (!contentType.includes('video/') && !contentType.includes('application/octet-stream'))) {
        console.warn('[VideoManager] Unexpected content type:', contentType, 'but proceeding anyway')
      }

      const blob = await response.blob()
      console.log('[VideoManager] Blob downloaded:', blob.size, 'bytes, type:', blob.type)
      return blob
    } catch (fetchError) {
      console.error('[VideoManager] Detailed fetch error:', {
        url,
        error: fetchError,
        name: fetchError instanceof Error ? fetchError.name : 'Unknown',
        message: fetchError instanceof Error ? fetchError.message : String(fetchError)
      })
      throw fetchError
    }
  }

  // Get direct URL for immediate playback (bypassing blob cache for instant playback)
  public getDirectVideoUrl(videoId: string): string | null {
    const config = VIDEO_CONFIGS.find(c => c.id === videoId)
    if (!config) {
      console.error('[VideoManager] No config found for video:', videoId)
      return null
    }

    const optimalQuality = getOptimalQuality(
      this.connectionInfo,
      true,
      typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      typeof window !== 'undefined' ? isMobileDevice() : false
    )

    return getOptimalVideoUrl(config, optimalQuality)
  }

  // Get object URL for cached video blob (for optimized playback after preload)
  // Returns null if blob caching fails - caller should fall back to direct URL
  public async getVideoObjectUrl(videoId: string, isVisible: boolean = true): Promise<string | null> {
    console.log('[VideoManager] getVideoObjectUrl called for:', videoId, 'isVisible:', isVisible)

    const cacheEntry = this.cache.get(videoId)

    if (!cacheEntry) {
      console.log('[VideoManager] No cache entry for:', videoId, 'starting download')
      const config = VIDEO_CONFIGS.find(c => c.id === videoId)
      if (!config) {
        console.error('[VideoManager] No config found for video:', videoId)
        return null
      }

      // Start loading immediately but don't block initial render
      if (isVisible) {
        // Don't await - start the download in background
        this.preloadVideo(videoId).catch(error => {
          console.error('[VideoManager] Background preload failed for:', videoId, error)
          // Don't return null here - let the caller handle fallback to direct URL
        })
      }
      return null
    }

    cacheEntry.lastUsed = Date.now()

    if (cacheEntry.isLoaded && cacheEntry.objectUrl) {
      console.log('[VideoManager] Returning cached object URL for:', videoId)
      return cacheEntry.objectUrl
    }

    if (cacheEntry.isLoading && cacheEntry.loadPromise) {
      console.log('[VideoManager] Video is loading, waiting for completion:', videoId)
      try {
        await cacheEntry.loadPromise
        if (cacheEntry.objectUrl) {
          return cacheEntry.objectUrl
        } else {
          console.warn('[VideoManager] Video load completed but no object URL available for:', videoId)
          return null
        }
      } catch (error) {
        console.error('[VideoManager] Failed to wait for video load:', videoId, error)
        // Return null so caller can fall back to direct URL
        return null
      }
    }

    return null
  }

  // Create a new video element with the object URL
  public createVideoElement(objectUrl: string): HTMLVideoElement {
    const video = document.createElement('video')

    video.src = objectUrl
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.loop = true

    // Critical mobile attributes for autoplay and inline playback
    video.setAttribute('webkit-playsinline', 'true')
    video.setAttribute('playsinline', 'true')
    video.setAttribute('muted', 'true')
    video.setAttribute('autoplay', 'false') // Let SharedVideo handle autoplay timing

    // iOS-specific optimizations
    if (this.isMobileDevice()) {
      video.preload = 'metadata' // Conservative preload on mobile
      video.setAttribute('x-webkit-airplay', 'allow')
    }

    console.log('[VideoManager] Created video element with mobile optimizations')
    return video
  }

  // Helper to detect mobile devices (using imported utility)
  private isMobileDevice(): boolean {
    return isMobileDevice()
  }

  // Cleanup old object URLs to prevent memory leaks
  private cleanupObjectUrl(videoId: string) {
    const cacheEntry = this.cache.get(videoId)
    if (cacheEntry && cacheEntry.objectUrl) {
      URL.revokeObjectURL(cacheEntry.objectUrl)
      cacheEntry.objectUrl = null
      console.log('[VideoManager] Cleaned up object URL for:', videoId)
    }
  }

  // Cache management
  private manageCacheSize() {
    const cacheEntries = Array.from(this.cache.values())

    if (cacheEntries.length > this.maxCacheSize) {
      // Sort by last used time and remove oldest
      cacheEntries.sort((a, b) => a.lastUsed - b.lastUsed)

      const toRemove = cacheEntries.slice(0, cacheEntries.length - this.maxCacheSize)
      toRemove.forEach(entry => {
        console.log('[VideoManager] Removing cached video to manage cache size:', entry.id)
        this.cleanupObjectUrl(entry.id)
        this.cache.delete(entry.id)
      })
    }
  }

  // Note: Video control methods are no longer needed at the VideoManager level
  // since each SharedVideo component manages its own HTMLVideoElement
  // Control happens directly on the video elements in the components

  // Event system
  public addEventListener(callback: VideoEventCallback): void {
    this.eventCallbacks.push(callback)
  }

  public removeEventListener(callback: VideoEventCallback): void {
    const index = this.eventCallbacks.indexOf(callback)
    if (index > -1) {
      this.eventCallbacks.splice(index, 1)
    }
  }

  private emitEvent(videoId: string, event: string, data?: unknown): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(videoId, event, data)
      } catch (error) {
        console.error('Video event callback error:', error)
      }
    })
  }

  // Public getters
  public getConnectionInfo(): ConnectionInfo {
    return { ...this.connectionInfo }
  }

  public getLoadedVideos(): string[] {
    return Array.from(this.cache.values())
      .filter(entry => entry.isLoaded)
      .map(entry => entry.id)
  }

  public getPreloadedVideos(): string[] {
    return Array.from(this.cache.values())
      .filter(entry => entry.isLoaded && entry.blob)
      .map(entry => entry.id)
  }

  public getTotalDownloadedSize(): number {
    let totalSize = 0
    this.cache.forEach(entry => {
      if (entry.isLoaded && entry.blob) {
        totalSize += entry.blob.size / (1024 * 1024) // Convert to MB
      }
    })
    return totalSize
  }

  // Cleanup
  public dispose(): void {
    this.cache.forEach(entry => {
      this.cleanupObjectUrl(entry.id)
    })
    this.cache.clear()
    this.preloadQueue = []
    this.eventCallbacks = []
    this.isPreloading = false
    console.log('[VideoManager] VideoManager disposed and all object URLs cleaned up')
  }
}

// Singleton instance
export const VideoManager = new VideoManagerClass()

// React hook for easy integration
export function useVideoManager() {
  return VideoManager
}