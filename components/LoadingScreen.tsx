'use client'

import { useEffect } from 'react'

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  useEffect(() => {
    // Show loading for 2.5 seconds then trigger completion
    const timer = setTimeout(() => {
      onLoadingComplete()
    }, 2500)

    return () => clearTimeout(timer)
  }, [onLoadingComplete])

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      {/* Logo */}
      <h1 
        className="text-4xl md:text-5xl font-oswald font-bold text-charcoal tracking-wide uppercase"
      >
        TiamaFilms
      </h1>
      
      {/* Simple loading dots */}
      <div className="absolute bottom-20 flex space-x-2">
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