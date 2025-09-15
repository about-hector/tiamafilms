'use client'

import { useEffect, useState } from 'react'
import { useConnectionAware } from '@/contexts/VideoContext'

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const { shouldPreload } = useConnectionAware()
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Loading...')

  useEffect(() => {
    // Simplified loading - since we're using direct URLs, no preloading needed
    setLoadingText('Preparing experience...')

    // Simulate loading progress for visual feedback
    let currentProgress = 0
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 20 + 10
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(progressInterval)
      }
      setProgress(currentProgress)
    }, 150)

    // Minimum loading time of 1.5 seconds for brand experience
    const minTimer = setTimeout(() => {
      setLoadingText('Ready')
      onLoadingComplete()
    }, 1500)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(minTimer)
    }
  }, [onLoadingComplete])

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

        <div className="w-full bg-warm-grey/30 rounded-full h-1 overflow-hidden">
          <div
            className="h-full bg-charcoal transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
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