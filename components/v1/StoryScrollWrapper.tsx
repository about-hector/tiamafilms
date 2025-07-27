'use client'

import { useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

interface StoryScrollWrapperProps {
  children: ReactNode[]
  normalContent?: ReactNode
}

const StoryScrollWrapper = ({ children, normalContent }: StoryScrollWrapperProps) => {
  const [currentStory, setCurrentStory] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mode, setMode] = useState<'story' | 'normal'>('story')
  const [canTransitionBack, setCanTransitionBack] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollAccumulatorRef = useRef(0)
  const lastWheelTimeRef = useRef(0)
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const bottomSentinelRef = useRef<HTMLDivElement>(null)
  const lastStoryRef = useRef<HTMLDivElement>(null)
  
  const wrapperControls = useAnimationControls()
  const moduleControls = useAnimationControls()
  
  const SCROLL_THRESHOLD = 50
  const SCROLL_TIMEOUT = 500
  const TRANSITION_DURATION = 0.4
  const SCALE_FACTOR = 0.95
  
  const isLastStory = currentStory === children.length - 1

  // Set up intersection observers for the sentinels
  useEffect(() => {
    if (mode !== 'normal') {
      setCanTransitionBack(false)
      return
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0
    }

    // Observer for top sentinel - detects when user has scrolled back to last story
    const topObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Top sentinel is visible - user is at the last story
          setCanTransitionBack(true)
        } else {
          // Top sentinel is not visible - user has scrolled away
          setCanTransitionBack(false)
        }
      })
    }, observerOptions)

    if (topSentinelRef.current) {
      topObserver.observe(topSentinelRef.current)
    }

    return () => {
      topObserver.disconnect()
    }
  }, [mode])

  // Perform story transition with animation
  const performTransition = useCallback(async (newStory: number) => {
    if (isTransitioning || newStory < 0 || newStory >= children.length) return
    
    setIsTransitioning(true)
    
    try {
      // Fade out and scale down
      await Promise.all([
        wrapperControls.start({ 
          scale: SCALE_FACTOR,
          transition: { duration: TRANSITION_DURATION, ease: [0.25, 0.46, 0.45, 0.94] }
        }),
        moduleControls.start({ 
          opacity: 0,
          transition: { duration: TRANSITION_DURATION, ease: [0.25, 0.46, 0.45, 0.94] }
        })
      ])
      
      // Change story
      setCurrentStory(newStory)
      
      // Fade in and scale up
      await Promise.all([
        wrapperControls.start({ 
          scale: 1,
          transition: { duration: TRANSITION_DURATION, ease: [0.25, 0.46, 0.45, 0.94] }
        }),
        moduleControls.start({ 
          opacity: 1,
          transition: { duration: TRANSITION_DURATION, ease: [0.25, 0.46, 0.45, 0.94] }
        })
      ])
    } finally {
      setIsTransitioning(false)
    }
  }, [isTransitioning, children.length, wrapperControls, moduleControls])

  // Handle wheel events
  const handleWheel = useCallback((e: WheelEvent) => {
    const now = Date.now()
    const timeSinceLastWheel = now - lastWheelTimeRef.current
    
    // Reset accumulator if too much time has passed
    if (timeSinceLastWheel > SCROLL_TIMEOUT) {
      scrollAccumulatorRef.current = 0
    }
    
    lastWheelTimeRef.current = now

    if (mode === 'normal') {
      // In normal mode, check if we should transition back to story mode
      if (e.deltaY < 0 && canTransitionBack) {
        const container = containerRef.current
        if (!container) return
        
        // Check if we're at the very top of the last story
        const topSentinel = topSentinelRef.current
        
        if (topSentinel) {
          const rect = topSentinel.getBoundingClientRect()
          // If top sentinel is at or above the top of viewport and we're scrolling up
          if (rect.top >= -5 && rect.top <= 5) {
            e.preventDefault()
            setMode('story')
            setCanTransitionBack(false)
            
            // Go to previous story
            if (currentStory > 0) {
              performTransition(currentStory - 1)
            }
          }
        }
      }
      return
    }

    // Story mode - always prevent default
    e.preventDefault()
    
    if (isTransitioning) return
    
    // Accumulate scroll
    scrollAccumulatorRef.current += Math.abs(e.deltaY)
    
    if (scrollAccumulatorRef.current >= SCROLL_THRESHOLD) {
      scrollAccumulatorRef.current = 0
      
      if (e.deltaY > 0) {
        // Scrolling down
        if (currentStory < children.length - 1) {
          performTransition(currentStory + 1)
        } else if (isLastStory) {
          // Switch to normal scroll mode
          setMode('normal')
          if (containerRef.current) {
            // Start at top of normal scroll container
            containerRef.current.scrollTop = 0
            
            // Scroll to show the last story at the top after a brief delay
            setTimeout(() => {
              if (containerRef.current && lastStoryRef.current) {
                const lastStoryTop = lastStoryRef.current.offsetTop
                containerRef.current.scrollTo({
                  top: lastStoryTop,
                  behavior: 'smooth'
                })
              }
            }, 100)
          }
        }
      } else {
        // Scrolling up
        if (currentStory > 0) {
          performTransition(currentStory - 1)
        }
      }
    }
  }, [mode, canTransitionBack, currentStory, isLastStory, children.length, isTransitioning, performTransition])

  // Set up wheel listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return
      
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (mode === 'normal') return
        
        e.preventDefault()
        
        if (currentStory < children.length - 1) {
          performTransition(currentStory + 1)
        } else if (isLastStory) {
          setMode('normal')
          if (containerRef.current) {
            containerRef.current.scrollTop = 0
            
            setTimeout(() => {
              if (containerRef.current && lastStoryRef.current) {
                const lastStoryTop = lastStoryRef.current.offsetTop
                containerRef.current.scrollTo({
                  top: lastStoryTop,
                  behavior: 'smooth'
                })
              }
            }, 100)
          }
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (mode === 'normal') {
          // Check if we can transition back
          if (canTransitionBack && topSentinelRef.current) {
            const rect = topSentinelRef.current.getBoundingClientRect()
            if (rect.top >= -5 && rect.top <= 5) {
              e.preventDefault()
              setMode('story')
              setCanTransitionBack(false)
              
              if (currentStory > 0) {
                performTransition(currentStory - 1)
              }
            }
          }
          return
        }
        
        e.preventDefault()
        if (currentStory > 0) {
          performTransition(currentStory - 1)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, canTransitionBack, currentStory, isLastStory, children.length, isTransitioning, performTransition])

  return (
    <div 
      ref={containerRef}
      className={`relative w-full transition-all duration-300 ${
        mode === 'normal' ? 'h-auto overflow-y-auto' : 'h-screen overflow-hidden'
      }`}
      style={{
        position: mode === 'story' ? 'fixed' : 'relative',
        inset: mode === 'story' ? 0 : 'auto',
      }}
    >
      {/* Story content */}
      <motion.div
        animate={wrapperControls}
        className="relative w-full"
        style={{
          height: mode === 'story' ? '100%' : '100vh',
        }}
      >
        <motion.div
          animate={moduleControls}
          className="w-full h-full"
          ref={isLastStory ? lastStoryRef : undefined}
        >
          {/* Top sentinel - placed at the very top of the last story */}
          {isLastStory && mode === 'normal' && (
            <div 
              ref={topSentinelRef} 
              className="absolute top-0 left-0 w-full h-1 pointer-events-none"
              aria-hidden="true"
            />
          )}
          
          {children[currentStory]}
          
          {/* Bottom sentinel - placed at the very bottom of the last story */}
          {isLastStory && mode === 'normal' && (
            <div 
              ref={bottomSentinelRef} 
              className="absolute bottom-0 left-0 w-full h-1 pointer-events-none"
              aria-hidden="true"
            />
          )}
        </motion.div>
      </motion.div>
      
      {/* Normal scrollable content */}
      {mode === 'normal' && normalContent && (
        <div className="w-full">
          {normalContent}
        </div>
      )}
      
      {/* UI Elements */}
      {mode === 'story' && (
        <>
          {/* Story indicators */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-50">
            {children.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning && index !== currentStory) {
                    performTransition(index)
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStory 
                    ? 'bg-charcoal w-8' 
                    : 'bg-charcoal/30 hover:bg-charcoal/60'
                }`}
                aria-label={`Go to story ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Scroll hints */}
          {currentStory === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed bottom-16 right-8 text-right text-charcoal/60 z-50"
            >
              <p className="text-xs font-oswald font-medium uppercase tracking-wider mb-2">
                Scroll to Navigate
              </p>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="ml-auto w-4 h-6 border border-charcoal/40 rounded-full flex justify-center"
              >
                <div className="w-0.5 h-2 bg-charcoal/60 rounded-full mt-1" />
              </motion.div>
            </motion.div>
          )}
          
          {isLastStory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed bottom-16 left-1/2 transform -translate-x-1/2 text-center text-charcoal/60 z-50"
            >
              <p className="text-xs font-oswald font-medium uppercase tracking-wider">
                Continue Scrolling to See More
              </p>
            </motion.div>
          )}
        </>
      )}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-2 text-xs rounded z-[100]">
          <div>Mode: {mode}</div>
          <div>Story: {currentStory + 1}/{children.length}</div>
          <div>Can Transition: {canTransitionBack ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
}

export default StoryScrollWrapper 