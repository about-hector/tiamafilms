'use client'

import { useEffect, useState } from 'react'
import { useVideo, useConnectionAware } from '@/contexts/VideoContext'
import { VIDEO_CONFIGS } from '@/lib/videoConfig'

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const { startPreloading, preloadedVideos, totalDownloadedSize, isPreloading } = useVideo()
  const { shouldPreload } = useConnectionAware()
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Loading...')

  useEffect(() => {
    // Start preloading immediately if connection allows
    if (shouldPreload) {
      // Prioritize videos that appear first on the page
      const priorityOrder = ['caroline-eran', 'celine-chris', 'irene-steven', 'kirstie-kyle', 'roxanna-james']
      startPreloading(priorityOrder)
      setLoadingText('Preparing videos...')
    }

    // Minimum loading time of 1.5 seconds
    const minTimer = setTimeout(() => {
      if (!shouldPreload || preloadedVideos.length >= 2) {
        onLoadingComplete()
      }
    }, 1500)

    // Maximum loading time of 4 seconds
    const maxTimer = setTimeout(() => {
      onLoadingComplete()
    }, 4000)

    return () => {
      clearTimeout(minTimer)
      clearTimeout(maxTimer)
    }
  }, [onLoadingComplete, shouldPreload, startPreloading, preloadedVideos.length])

  // Update progress and text based on preloading status
  useEffect(() => {
    if (!shouldPreload) {
      setProgress(100)
      setLoadingText('Ready')
      return
    }

    const totalVideos = VIDEO_CONFIGS.length
    const loadedCount = preloadedVideos.length
    const progressPercent = Math.min((loadedCount / totalVideos) * 100, 100)

    setProgress(progressPercent)

    if (loadedCount === 0) {
      setLoadingText('Preparing videos...')
    } else if (loadedCount < totalVideos) {
      setLoadingText(`Loading videos (${loadedCount}/${totalVideos})`)
    } else {
      setLoadingText('Ready')
    }
  }, [preloadedVideos.length, shouldPreload])

  // Complete loading when enough videos are ready
  useEffect(() => {
    if (preloadedVideos.length >= 3 || (!isPreloading && preloadedVideos.length > 0)) {
      const timer = setTimeout(() => {
        onLoadingComplete()
      }, 300) // Small delay for smooth transition

      return () => clearTimeout(timer)
    }
  }, [preloadedVideos.length, isPreloading, onLoadingComplete])

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
      {/* Logo */}
      <h1
        className="text-4xl md:text-5xl font-oswald font-bold text-charcoal tracking-wide uppercase mb-8"
      >
        TiamaFilms
      </h1>

      {/* Progress indicator */}
      <div className="w-64 mb-4">
        <div className="text-center text-sm text-dark-grey mb-2 font-oswald uppercase tracking-wide">
          {loadingText}
        </div>

        {shouldPreload && (
          <div className="w-full bg-warm-grey/30 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-charcoal transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Data usage indicator for mobile users */}
        {shouldPreload && totalDownloadedSize > 0 && (
          <div className="text-center text-xs text-dark-grey/70 mt-2">
            {Math.round(totalDownloadedSize)}MB loaded
          </div>
        )}
      </div>

      {/* Loading animation */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-2 h-2 bg-charcoal rounded-full animate-pulse"
            style={{
              animationDelay: `${index * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default LoadingScreen 