'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useScroll, useTransform } from 'framer-motion'
import Header from './Header'

const V2MasonryHero = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  // Video refs to control playback rate
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  
  // Scroll velocity tracking for reactive animation
  const scrollVelocity = useMotionValue(0)
  const smoothScrollVelocity = useMotionValue(0)
  const lastScrollTime = useRef(0)
  const lastScrollY = useRef(0)
  
  // Scroll progress for fade effect
  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  // Fade out effect as user scrolls
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95])
  
  // Motion values for each video column
  const videoPositions = [
    useMotionValue(0), // Column 1 (left - half visible)
    useMotionValue(0), // Column 2 (full)
    useMotionValue(0), // Column 3 (center - full)
    useMotionValue(0), // Column 4 (full)
    useMotionValue(0), // Column 5 (right - half visible)
  ]

  // Different initial Y positions and scroll configs for each column - varied speeds for fashion magazine feel
  const columnConfigs = [
    { initialY: -100, speed: 0.3, direction: 1 },   // Column 1: slow and steady
    { initialY: 50, speed: 1.2, direction: -1 },    // Column 2: fast upward movement  
    { initialY: -150, speed: 0.7, direction: 1 },   // Column 3: medium pace down
    { initialY: 80, speed: 0.5, direction: -1 },    // Column 4: slower upward drift
    { initialY: -80, speed: 1.5, direction: 1 },    // Column 5: fastest downward flow
  ]

  // Video file paths
  const videoFiles = [
    '/reels/mp4/Caroline Eran IG Reel.mp4',
    '/reels/mp4/Celine Chris IG Reel.mp4',
    '/reels/mp4/Irene Steven Reel.mp4',
    '/reels/mp4/Kirstie & Kyle Reel.mp4',
    '/reels/mp4/Roxanna James IG Reel.mp4'
  ]

  // Track scroll velocity for reactive animation
  useAnimationFrame((time) => {
    const currentScrollY = scrollY.get()
    const currentTime = time
    
    // Calculate scroll velocity (pixels per millisecond)
    if (lastScrollTime.current > 0) {
      const deltaTime = currentTime - lastScrollTime.current
      const deltaScroll = currentScrollY - lastScrollY.current
      
      if (deltaTime > 0) {
        const velocity = Math.abs(deltaScroll) / deltaTime
        scrollVelocity.set(velocity)
        
        // Smooth the velocity using ease-out-cubic easing for natural feel
        const currentSmooth = smoothScrollVelocity.get()
        const targetSmooth = velocity * 0.5 // Increased scaling for more pronounced effect
        const smoothed = currentSmooth + (targetSmooth - currentSmooth) * 0.25 // More responsive interpolation
        smoothScrollVelocity.set(smoothed)
      }
    }
    
    lastScrollTime.current = currentTime
    lastScrollY.current = currentScrollY
    
    // Infinite marquee animation with scroll reactivity
    const scrollProgress = scrollYProgress.get()
    const baseSpeed = 0.4 // Increased base animation speed
    const scrollPositionMultiplier = 1 + scrollProgress * 2 // Increased position-based acceleration
    const scrollVelocityMultiplier = 1 + smoothScrollVelocity.get() * 25 // Much stronger velocity-based boost
    const motionReduction = prefersReducedMotion ? 0.3 : 1 // More significant reduction for accessibility
    
    // Add subtle randomness for fashion magazine feel
    const timeVariation = Math.sin(time * 0.0005) * 0.1 + 1
    
    videoPositions.forEach((position, index) => {
      const config = columnConfigs[index]
      // Add individual variation per column for more randomness
      const columnVariation = Math.sin(time * 0.0003 + index * 1.5) * 0.15 + 1
      const finalSpeed = config.speed * baseSpeed * scrollPositionMultiplier * scrollVelocityMultiplier * motionReduction * timeVariation * columnVariation
      const direction = config.direction
      const currentValue = position.get()
      const newValue = currentValue + (finalSpeed * direction)
      
      // Infinite loop bounds - when going off screen, wrap to opposite side
      const viewportHeight = window.innerHeight
      const cardHeight = viewportHeight * 0.6 // Approximate card height
      const maxOffset = viewportHeight + cardHeight
      const minOffset = -(viewportHeight + cardHeight)
      
      if (newValue > maxOffset) {
        // Card went off bottom, bring it back from top
        position.set(minOffset)
      } else if (newValue < minOffset) {
        // Card went off top, bring it back from bottom  
        position.set(maxOffset)
      } else {
        position.set(newValue)
      }
    })
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
      
      // Update video playback rates
      videoRefs.current.forEach((video) => {
        if (video) {
          video.playbackRate = mediaQuery.matches ? 0.75 : 1
        }
      })
    }
    
    // Set initial value
    handleChange()
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Add velocity decay when not scrolling for natural feel
  useEffect(() => {
    const decayInterval = setInterval(() => {
      const currentVelocity = smoothScrollVelocity.get()
      // Smooth decay using ease-out-cubic curve for natural deceleration
      const decayedVelocity = currentVelocity * 0.88 // Faster decay for more immediate response
      smoothScrollVelocity.set(decayedVelocity)
    }, 16) // ~60fps decay rate
    
    return () => clearInterval(decayInterval)
  }, [])

  // Initialize video positions to their starting values
  useEffect(() => {
    videoPositions.forEach((position, index) => {
      position.set(columnConfigs[index].initialY)
    })
  }, [])



  return (
    <motion.div 
      ref={containerRef}
      className="relative w-full h-screen bg-white"
      style={{ opacity, scale }}
    >
      {/* Header */}
      <Header />

      {/* 5-Column Video Layout */}
      <div className="absolute inset-0 pt-20 overflow-hidden">
        {/* Container wider than screen to allow side columns to overflow */}
        <div className="relative w-[125%] -left-[12.5%] h-full flex">
          {[0, 1, 2, 3, 4].map((columnIndex) => {
            // On mobile, only show 3 middle columns
            if (isMobile && (columnIndex === 0 || columnIndex === 4)) return null
            
            const config = columnConfigs[columnIndex]
            
            return (
              <div
                key={columnIndex}
                className={`${isMobile ? 'flex-1' : 'flex-1'} h-full flex items-center justify-center px-2`}
              >
                <motion.div
                  className="relative group cursor-pointer"
                  style={{
                    aspectRatio: '9/16',
                    width: '100%',
                    height: 'auto',
                    y: useTransform(() => 
                      videoPositions[columnIndex].get()
                    ),
                    // Add subtle scale effect based on scroll velocity for visual feedback
                    scale: useTransform(() => {
                      const velocity = smoothScrollVelocity.get()
                      const maxScale = prefersReducedMotion ? 1.03 : 1.08
                      return 1 + (velocity * 1.2 * (maxScale - 1))
                    }),
                    // Add subtle rotation for more dynamic feel
                    rotateZ: useTransform(() => {
                      if (prefersReducedMotion) return 0
                      const velocity = smoothScrollVelocity.get()
                      const maxRotation = 2.5
                      const direction = config.direction
                      return direction * velocity * 3 * maxRotation
                    })
                  }}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.9,
                    y: 50
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: 0
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: [0.215, 0.61, 0.355, 1], // ease-out-cubic from animations.mdc
                    delay: 0.1 * columnIndex,
                    type: "spring",
                    stiffness: 120,
                    damping: 25
                  }}
                >
                  {/* Video Container */}
                  <div className="w-full h-full rounded-xl overflow-hidden shadow-medium">
                    <video
                      ref={(el) => {
                        videoRefs.current[columnIndex] = el
                        if (el) {
                          // Set initial playback rate based on motion preference
                          el.playbackRate = prefersReducedMotion ? 0.75 : 1
                        }
                      }}
                      src={videoFiles[columnIndex]}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  </div>

                  {/* Subtle hover overlay for interactivity feedback */}
                  <motion.div
                    className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 rounded-xl pointer-events-none"
                    initial={false}
                    whileHover={{ opacity: 1 }}
                    transition={{
                      duration: 0.2,
                      ease: [0.25, 0.46, 0.45, 0.94] // ease-out-quad from animations.mdc
                    }}
                  />
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Centered overlay text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: 0.5, 
          ease: [0.23, 1, 0.32, 1], // ease-out-quint from animations.mdc
          type: "spring",
          stiffness: 120,
          damping: 25
        }}
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        style={{ mixBlendMode: 'difference' }}
      >
        <div className="text-center text-white max-w-4xl px-8">
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.7,
              ease: [0.215, 0.61, 0.355, 1], // ease-out-cubic from animations.mdc
              type: "spring",
              stiffness: 120,
              damping: 22
            }}
            className="text-4xl md:text-6xl lg:text-7xl font-oswald font-bold mb-4 uppercase leading-tight text-white"
          >
            Cinematic Wedding<br />Videographers
          </motion.h2>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.9,
              ease: [0.215, 0.61, 0.355, 1], // ease-out-cubic from animations.mdc
              type: "spring",
              stiffness: 120,
              damping: 20
            }}
            className="text-sm md:text-base font-oswald font-medium uppercase tracking-wider text-white opacity-90"
          >
            Since 2009
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default V2MasonryHero 