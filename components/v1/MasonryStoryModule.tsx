'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'

interface VideoBlock {
  id: number
  height: number
}

const generateBlocks = (count: number): VideoBlock[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    height: Math.random() * 150 + 250, // Random height between 250-400px for better control
  }))
}

const MasonryStoryModule = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const [userScrolling, setUserScrolling] = useState(false)
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  // Create motion values for each column
  const columnScrolls = [
    useMotionValue(0), // Column 1: bottom to top
    useMotionValue(0), // Column 2: top to bottom
    useMotionValue(0), // Column 3: bottom to top
    useMotionValue(0), // Column 4: top to bottom
  ]

  // Generate blocks for each column
  const columns = [
    generateBlocks(10),
    generateBlocks(9),
    generateBlocks(8),
    generateBlocks(10),
  ]

  // Different scroll speeds for each column
  const scrollSpeeds = [0.5, 0.7, 0.4, 0.6]

  // Auto-scroll animation
  useAnimationFrame((time) => {
    if (isAutoScrolling && !userScrolling) {
      const baseSpeed = 0.015
      
      columnScrolls.forEach((scroll, index) => {
        const speed = scrollSpeeds[index] * baseSpeed
        const direction = index % 2 === 0 ? -1 : 1 // Alternate directions
        const currentValue = scroll.get()
        const newValue = currentValue + (speed * direction * 100)
        
        // Add bounds to prevent overflow - reset position when too far
        const maxOffset = 2000 // Maximum offset before reset
        if (Math.abs(newValue) > maxOffset) {
          scroll.set(direction * -100) // Reset to opposite direction
        } else {
          scroll.set(newValue)
        }
      })
    }
  })

  // Initial auto-scroll setup
  useEffect(() => {
    // Start auto-scrolling after 5 seconds of page load
    autoScrollTimeoutRef.current = setTimeout(() => {
      setIsAutoScrolling(true)
    }, 5000)

    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
        className="absolute top-0 left-0 right-0 z-20 p-6 md:p-8"
      >
        <div className="flex justify-between items-center">
          <h1 
            className="text-2xl md:text-3xl font-oswald font-bold text-charcoal tracking-wide uppercase"
          >
            TiamaFilms
          </h1>
          <nav className="hidden md:flex space-x-8 text-sm text-charcoal/80 font-oswald font-medium uppercase tracking-wider">
            <a href="#" className="hover:text-charcoal transition-colors duration-200">
              Portfolio
            </a>
            <a href="#" className="hover:text-charcoal transition-colors duration-200">
              About
            </a>
            <a href="#" className="hover:text-charcoal transition-colors duration-200">
              Contact
            </a>
          </nav>
        </div>
      </motion.header>

      {/* Masonry Grid */}
      <div className="masonry-hero absolute inset-0 pt-20 overflow-hidden">
        <div className={`masonry-container grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 md:gap-4 h-full px-4 md:px-8 overflow-hidden`}>
          {columns.map((column, columnIndex) => {
            // On mobile, only show first 2 columns
            if (isMobile && columnIndex > 1) return null
            
            return (
              <motion.div
                key={columnIndex}
                className="flex flex-col space-y-2 md:space-y-4 shrink-0 h-full overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.215, 0.61, 0.355, 1],
                  delay: 0.6 + (columnIndex * 0.1) // Stagger the columns
                }}
                style={{
                  y: columnScrolls[columnIndex],
                }}
              >
                {/* Render blocks multiple times to create infinite scroll effect */}
                {[...Array(3)].map((_, repeatIndex) => (
                  <div key={repeatIndex}>
                    {column.map((block) => (
                      <motion.div
                        key={`${repeatIndex}-${block.id}`}
                        className="masonry-card relative mb-2 md:mb-4 group cursor-pointer shrink-0"
                        style={{
                          aspectRatio: '9/16',
                          minHeight: `${isMobile ? block.height * 0.7 : block.height}px`,
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Play video ${block.id + 1}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            // Handle video play
                          }
                        }}
                      >
                        {/* Video Placeholder */}
                        <div className="w-full h-full bg-gradient-to-br from-light-grey to-medium-grey rounded-lg overflow-hidden border border-warm-grey/30 shadow-medium">
                          <div className="w-full h-full bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-center">
                            <div className="text-charcoal/70 text-center">
                              <div className="w-6 h-6 md:w-12 md:h-12 mx-auto mb-2 bg-charcoal/10 rounded-full flex items-center justify-center">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-3 h-3 md:w-6 md:h-6"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                              <p className="text-xs font-oswald font-medium uppercase tracking-wider">
                                Video {block.id + 1}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Hover Overlay - Only on non-touch devices */}
                        <motion.div
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg items-center justify-center hover-only backdrop-blur-sm"
                          initial={false}
                        >
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileHover={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="text-white text-center"
                          >
                            <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                            <p className="text-sm font-oswald font-medium uppercase tracking-wide">
                              Play Video
                            </p>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Centered overlay text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
      >
        <div className="text-center text-charcoal max-w-4xl px-8">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-sm md:text-base font-oswald font-medium uppercase tracking-wider text-warm-grey mb-4"
          >
            Cinematic Wedding Films
          </motion.p>
          
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-oswald font-bold mb-8 uppercase leading-tight"
          >
            Your Love<br />Story Awaits
          </motion.h2>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="text-lg md:text-xl text-dark-grey font-inter leading-relaxed max-w-2xl mx-auto"
          >
            Timeless cinematic storytelling that captures every precious moment of your special day with artistic vision and emotional depth.
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

export default MasonryStoryModule 