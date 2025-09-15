'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useAnimationFrame, useMotionValue, useScroll, useTransform } from 'framer-motion'
import Header from './Header'
import SharedVideo from './SharedVideo'

const V2MasonryHero = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [userHasInteracted, setUserHasInteracted] = useState(false)

  // Refs for each mobile card to get actual positions
  const mobileCardRefs = useRef<Array<Array<HTMLDivElement | null>>>([
    [null, null, null, null, null], // Column 1 cards
    [null, null, null, null, null], // Column 2 cards
    [null, null, null, null, null], // Column 3 cards
  ])
  
  
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

  // Motion values for blur amounts for each card in mobile columns
  const mobileBlurValues = [
    [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)], // Column 1 (index 1)
    [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)], // Column 2 (index 2)
    [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)], // Column 3 (index 3)
  ]

  // Motion values for opacity amounts for each card in mobile columns
  const mobileOpacityValues = [
    [useMotionValue(1), useMotionValue(1), useMotionValue(1), useMotionValue(1), useMotionValue(1)], // Column 1 (index 1)
    [useMotionValue(1), useMotionValue(1), useMotionValue(1), useMotionValue(1), useMotionValue(1)], // Column 2 (index 2)
    [useMotionValue(1), useMotionValue(1), useMotionValue(1), useMotionValue(1), useMotionValue(1)], // Column 3 (index 3)
  ]

  // Create blur transforms for each mobile card - explicit declarations to avoid hook violations
  const mobileBlurTransforms = [
    [
      useTransform(mobileBlurValues[0][0], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[0][1], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[0][2], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[0][3], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[0][4], (blur) => `blur(${blur}px)`)
    ],
    [
      useTransform(mobileBlurValues[1][0], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[1][1], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[1][2], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[1][3], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[1][4], (blur) => `blur(${blur}px)`)
    ],
    [
      useTransform(mobileBlurValues[2][0], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[2][1], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[2][2], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[2][3], (blur) => `blur(${blur}px)`),
      useTransform(mobileBlurValues[2][4], (blur) => `blur(${blur}px)`)
    ]
  ]

  // Create opacity transforms for each mobile card (no transform needed, use motion values directly)
  const mobileOpacityTransforms = mobileOpacityValues

  // Different initial Y positions and scroll configs for each column - closer positions for denser layout
  const columnConfigs = [
    { initialY: -50, speed: 0.3, direction: 1 },    // Column 1: slow and steady
    { initialY: 20, speed: 1.2, direction: -1 },    // Column 2: fast upward movement  
    { initialY: -80, speed: 0.7, direction: 1 },    // Column 3: medium pace down
    { initialY: 40, speed: 0.5, direction: -1 },    // Column 4: slower upward drift
    { initialY: -30, speed: 1.5, direction: 1 },    // Column 5: fastest downward flow
  ]

  // Video IDs (now mapped to R2 storage via VIDEO_CONFIGS)
  const videoIds = [
    'caroline-eran',
    'celine-chris',
    'irene-steven',
    'kirstie-kyle',
    'roxanna-james'
  ]

  // Different start times for visual variety (in seconds)
  const videoStartTimes = [
    12, // caroline-eran - start 12s in
    8,  // celine-chris - start 8s in
    15, // irene-steven - start 15s in
    5,  // kirstie-kyle - start 5s in
    20  // roxanna-james - start 20s in
  ]

  // Create multiple videos per column for mobile with position-based blur and scattered start times
  const getMobileColumnVideos = (columnIndex: number) => {
    // Add variation to start times to avoid repetitive look - much larger delta for variety
    const getVariedStartTime = (baseStartTime: number, videoIndex: number, columnIndex: number) => {
      // Much larger variation: 0-60 seconds spread across videos and columns
      const variation = (videoIndex * 15 + columnIndex * 20) % 60 // 0-59 seconds variation
      return Math.max(0, baseStartTime + variation) // Ensure we don't go negative
    }

    // Create different video orders for each column to avoid grid-like repetition
    const getColumnSpecificVideoOrder = (columnIndex: number) => {
      const shuffledIds = [...videoIds]
      const shuffledStartTimes = [...videoStartTimes]

      // Use column index as seed for consistent but different ordering per column
      // This ensures each column has a different arrangement
      switch (columnIndex) {
        case 1: // Column 1: rotate by 1
          return {
            ids: [shuffledIds[1], shuffledIds[2], shuffledIds[3], shuffledIds[4], shuffledIds[0]],
            times: [shuffledStartTimes[1], shuffledStartTimes[2], shuffledStartTimes[3], shuffledStartTimes[4], shuffledStartTimes[0]]
          }
        case 2: // Column 2: rotate by 2
          return {
            ids: [shuffledIds[2], shuffledIds[3], shuffledIds[4], shuffledIds[0], shuffledIds[1]],
            times: [shuffledStartTimes[2], shuffledStartTimes[3], shuffledStartTimes[4], shuffledStartTimes[0], shuffledStartTimes[1]]
          }
        case 3: // Column 3: rotate by 3
          return {
            ids: [shuffledIds[3], shuffledIds[4], shuffledIds[0], shuffledIds[1], shuffledIds[2]],
            times: [shuffledStartTimes[3], shuffledStartTimes[4], shuffledStartTimes[0], shuffledStartTimes[1], shuffledStartTimes[2]]
          }
        default: // Column 0 and others: keep original order
          return {
            ids: shuffledIds,
            times: shuffledStartTimes
          }
      }
    }

    const { ids: columnVideoIds, times: columnStartTimes } = getColumnSpecificVideoOrder(columnIndex)

    // Use scattered video order for this column
    return columnVideoIds.map((videoId, index) => ({
      videoId,
      startTime: getVariedStartTime(columnStartTimes[index], index, columnIndex),
      cardIndex: index,
      columnIndex
    }))
  }



  // Create transforms for each column explicitly to avoid hook violations
  const columnTransforms = [
    // Column 0
    {
      y: useTransform(() => videoPositions[0].get()),
      scale: useTransform(() => 1),
      rotateZ: useTransform(() => 0),
      opacity: useTransform(() => {
        const currentY = videoPositions[0].get()
        const viewportHeight = window.innerHeight
        const cardHeight = viewportHeight * 0.6
        const fadeZone = cardHeight * 0.4
        const maxBound = viewportHeight * 0.3 + cardHeight * 0.1
        const minBound = -(viewportHeight * 0.3 + cardHeight * 0.1)
        
        const distanceFromTop = currentY - minBound
        const distanceFromBottom = maxBound - currentY
        const minDistance = Math.min(distanceFromTop, distanceFromBottom)
        
        if (minDistance < fadeZone) {
          const fadeProgress = minDistance / fadeZone
          return Math.max(0.2, fadeProgress)
        }
        return 1
      }),
      filter: useTransform(() => {
        const currentY = videoPositions[0].get()
        const viewportHeight = window.innerHeight
        const cardHeight = viewportHeight * 0.6
        const blurZone = cardHeight * 0.3
        const maxBound = viewportHeight * 0.3 + cardHeight * 0.1
        const minBound = -(viewportHeight * 0.3 + cardHeight * 0.1)
        
        const distanceFromTop = currentY - minBound
        const distanceFromBottom = maxBound - currentY
        const minDistance = Math.min(distanceFromTop, distanceFromBottom)
        
        if (minDistance < blurZone) {
          const blurProgress = 1 - (minDistance / blurZone)
          const blurAmount = blurProgress * 8
          return `blur(${blurAmount}px)`
        }
        return 'blur(0px)'
      })
    },
    // Column 1
    {
      y: useTransform(() => videoPositions[1].get()),
      scale: useTransform(() => 1),
      rotateZ: useTransform(() => 0),
      opacity: useTransform(() => {
        const currentY = videoPositions[1].get()
        const viewportHeight = window.innerHeight
        const cardHeight = viewportHeight * 0.6
        const fadeZone = cardHeight * 0.4
        const maxBound = viewportHeight * 0.3 + cardHeight * 0.1
        const minBound = -(viewportHeight * 0.3 + cardHeight * 0.1)
        
        const distanceFromTop = currentY - minBound
        const distanceFromBottom = maxBound - currentY
        const minDistance = Math.min(distanceFromTop, distanceFromBottom)
        
        if (minDistance < fadeZone) {
          const fadeProgress = minDistance / fadeZone
          return Math.max(0.2, fadeProgress)
        }
        return 1
      }),
      filter: useTransform(() => {
        const currentY = videoPositions[1].get()
        const viewportHeight = window.innerHeight
        const cardHeight = viewportHeight * 0.6
        const blurZone = cardHeight * 0.3
        const maxBound = viewportHeight * 0.3 + cardHeight * 0.1
        const minBound = -(viewportHeight * 0.3 + cardHeight * 0.1)
        
        const distanceFromTop = currentY - minBound
        const distanceFromBottom = maxBound - currentY
        const minDistance = Math.min(distanceFromTop, distanceFromBottom)
        
        if (minDistance < blurZone) {
          const blurProgress = 1 - (minDistance / blurZone)
          const blurAmount = blurProgress * 8
          return `blur(${blurAmount}px)`
        }
        return 'blur(0px)'
      })
    },
    // Column 2
    {
      y: useTransform(() => videoPositions[2].get()),
      scale: useTransform(() => 1),
      rotateZ: useTransform(() => 0),
      opacity: useTransform(() => {
        const currentY = videoPositions[2].get()
        const viewportHeight = window.innerHeight
        const cardHeight = viewportHeight * 0.6
        const fadeZone = cardHeight * 0.4
        const maxBound = viewportHeight * 0.3 + cardHeight * 0.1
        const minBound = -(viewportHeight * 0.3 + cardHeight * 0.1)
        
        const distanceFromTop = currentY - minBound
        const distanceFromBottom = maxBound - currentY
        const minDistance = Math.min(distanceFromTop, distanceFromBottom)
        
        if (minDistance < fadeZone) {
          const fadeProgress = minDistance / fadeZone
          return Math.max(0.2, fadeProgress)
        }
        return 1
      }),
      filter: useTransform(() => {
        const currentY = videoPositions[2].get()
        const viewportHeight = window.innerHeight
        const cardHeight = viewportHeight * 0.6
        const blurZone = cardHeight * 0.3
        const maxBound = viewportHeight * 0.3 + cardHeight * 0.1
        const minBound = -(viewportHeight * 0.3 + cardHeight * 0.1)
        
        const distanceFromTop = currentY - minBound
        const distanceFromBottom = maxBound - currentY
        const minDistance = Math.min(distanceFromTop, distanceFromBottom)
        
        if (minDistance < blurZone) {
          const blurProgress = 1 - (minDistance / blurZone)
          const blurAmount = blurProgress * 8
          return `blur(${blurAmount}px)`
        }
        return 'blur(0px)'
      })
    },
    // Column 3
    {
      y: useTransform(() => videoPositions[3].get()),
      scale: useTransform(() => 1),
      rotateZ: useTransform(() => 0),
      opacity: useTransform(() => {
        const currentY = videoPositions[3].get()
        const viewportHeight = window.innerHeight
        const cardHeight = viewportHeight * 0.6
        const fadeZone = cardHeight * 0.4
        const maxBound = viewportHeight * 0.3 + cardHeight * 0.1
        const minBound = -(viewportHeight * 0.3 + cardHeight * 0.1)
        
        const distanceFromTop = currentY - minBound
        const distanceFromBottom = maxBound - currentY
        const minDistance = Math.min(distanceFromTop, distanceFromBottom)
        
        if (minDistance < fadeZone) {
          const fadeProgress = minDistance / fadeZone
          return Math.max(0.2, fadeProgress)
        }
        return 1
      }),
      filter: useTransform(() => {
        const currentY = videoPositions[3].get()
        const viewportHeight = window.innerHeight
        const cardHeight = viewportHeight * 0.6
        const blurZone = cardHeight * 0.3
        const maxBound = viewportHeight * 0.3 + cardHeight * 0.1
        const minBound = -(viewportHeight * 0.3 + cardHeight * 0.1)
        
        const distanceFromTop = currentY - minBound
        const distanceFromBottom = maxBound - currentY
        const minDistance = Math.min(distanceFromTop, distanceFromBottom)
        
        if (minDistance < blurZone) {
          const blurProgress = 1 - (minDistance / blurZone)
          const blurAmount = blurProgress * 8
          return `blur(${blurAmount}px)`
        }
        return 'blur(0px)'
      })
    },
    // Column 4
    {
      y: useTransform(() => videoPositions[4].get()),
      scale: useTransform(() => 1),
      rotateZ: useTransform(() => 0),
      opacity: useTransform(() => {
        const currentY = videoPositions[4].get()
        const viewportHeight = window.innerHeight
        const cardHeight = viewportHeight * 0.6
        const fadeZone = cardHeight * 0.4
        const maxBound = viewportHeight * 0.3 + cardHeight * 0.1
        const minBound = -(viewportHeight * 0.3 + cardHeight * 0.1)
        
        const distanceFromTop = currentY - minBound
        const distanceFromBottom = maxBound - currentY
        const minDistance = Math.min(distanceFromTop, distanceFromBottom)
        
        if (minDistance < fadeZone) {
          const fadeProgress = minDistance / fadeZone
          return Math.max(0.2, fadeProgress)
        }
        return 1
      }),
      filter: useTransform(() => {
        const currentY = videoPositions[4].get()
        const viewportHeight = window.innerHeight
        const cardHeight = viewportHeight * 0.6
        const blurZone = cardHeight * 0.3
        const maxBound = viewportHeight * 0.3 + cardHeight * 0.1
        const minBound = -(viewportHeight * 0.3 + cardHeight * 0.1)
        
        const distanceFromTop = currentY - minBound
        const distanceFromBottom = maxBound - currentY
        const minDistance = Math.min(distanceFromTop, distanceFromBottom)
        
        if (minDistance < blurZone) {
          const blurProgress = 1 - (minDistance / blurZone)
          const blurAmount = blurProgress * 8
          return `blur(${blurAmount}px)`
        }
        return 'blur(0px)'
      })
    }
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

      // Infinite loop bounds - very tight wrapping for continuous feel
      const viewportHeight = window.innerHeight
      const cardHeight = viewportHeight * 0.6 // Approximate card height
      const wrapBuffer = cardHeight * 0.1 // Minimal buffer for immediate wrapping
      const maxOffset = viewportHeight * 0.3 + wrapBuffer // Wrap as soon as card starts leaving
      const minOffset = -(viewportHeight * 0.3 + wrapBuffer)

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

    // Calculate blur and opacity values for mobile columns using actual DOM positions
    if (isMobile && containerRef.current && mobileBlurValues && mobileBlurValues.length > 0 && mobileOpacityValues && mobileOpacityValues.length > 0) {
      const heroRect = containerRef.current.getBoundingClientRect()
      const heroCenter = heroRect.top + (heroRect.height / 2)
      const heroHeight = heroRect.height

      // 20% clarity zone around center where cards are crystal clear
      const clarityZone = heroHeight * 0.1 // 10% above and below center = 20% total zone

      // For each visible mobile column (indices 1, 2, 3)
      const mobileColumns = [1, 2, 3]
      mobileColumns.forEach((columnIndex, mobileColumnIndex) => {
        // Safety check for motion values
        if (!videoPositions[columnIndex] || !mobileBlurValues[mobileColumnIndex] || !mobileOpacityValues[mobileColumnIndex]) {
          return
        }

        // Check each card using actual DOM position
        for (let cardIndex = 0; cardIndex < 5; cardIndex++) {
          // Safety check for individual card blur and opacity values
          if (!mobileBlurValues[mobileColumnIndex][cardIndex] || !mobileOpacityValues[mobileColumnIndex][cardIndex]) {
            continue
          }

          // Get the actual card element position
          const cardElement = mobileCardRefs.current[mobileColumnIndex]?.[cardIndex]
          if (!cardElement) {
            // If DOM element not available, skip this card
            continue
          }

          try {
            const cardRect = cardElement.getBoundingClientRect()
            const cardCenter = cardRect.top + (cardRect.height / 2)

            // Calculate distance from hero center
            const distanceFromHeroCenter = Math.abs(cardCenter - heroCenter)

            // Calculate blur and opacity based on distance from center
            let blurAmount = 0
            let opacityAmount = 1

            if (distanceFromHeroCenter <= clarityZone) {
              // Card is within 20% clarity zone - crystal clear
              blurAmount = 0
              opacityAmount = 1
            } else {
              // Card is outside clarity zone - progressive blur/fade
              const distanceOutsideClarityZone = distanceFromHeroCenter - clarityZone
              const maxBlurDistance = heroHeight * 0.4 // Blur reaches maximum at 40% of hero height from clarity zone

              // Calculate blur (0-3px) - reduced for better video quality appearance
              const normalizedBlurDistance = Math.min(distanceOutsideClarityZone / maxBlurDistance, 1)
              blurAmount = normalizedBlurDistance * 3

              // Calculate opacity (1.0 to 0.2) - more gradual fade
              const maxFadeDistance = heroHeight * 0.6 // Opacity reaches minimum at 60% of hero height from clarity zone
              const normalizedFadeDistance = Math.min(distanceOutsideClarityZone / maxFadeDistance, 1)
              opacityAmount = Math.max(0.2, 1 - (normalizedFadeDistance * 0.8))
            }

            // Update the motion values
            mobileBlurValues[mobileColumnIndex][cardIndex].set(blurAmount)
            mobileOpacityValues[mobileColumnIndex][cardIndex].set(opacityAmount)

          } catch (error) {
            // If getBoundingClientRect fails, skip this card
            console.debug('Card position calculation failed:', error)
            continue
          }
        }
      })
    }
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

      // Video playback rates are now handled by the VideoManager
      // which automatically adjusts based on user preferences and connection
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
  }, [smoothScrollVelocity])

  // Initialize video positions to their starting values
  useEffect(() => {
    videoPositions.forEach((position, index) => {
      position.set(columnConfigs[index].initialY)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Define which columns to show based on screen size
  const getVisibleColumns = () => {
    if (isMobile) {
      // On mobile, show only columns 1, 2, 3 (indices 1, 2, 3)
      return [1, 2, 3]
    }
    // On desktop, show all columns
    return [0, 1, 2, 3, 4]
  }

  const visibleColumns = getVisibleColumns()

  // Handle user interaction to enable video playback on mobile
  const handleUserInteraction = useCallback(() => {
    if (!userHasInteracted) {
      setUserHasInteracted(true)
      console.log('[V2MasonryHero] User interaction detected, enabling video playback')
    }
  }, [userHasInteracted])

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-screen bg-white"
      style={{ opacity, scale }}
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      {/* Header */}
      <Header />

      {/* Video Layout */}
      <div className="absolute inset-0 pt-20 overflow-hidden">
        {/* Container wider than screen to allow side columns to overflow */}
        <div className={`relative h-full flex ${isMobile ? 'w-full' : 'w-[125%] -left-[12.5%]'}`}>
          {visibleColumns.map((columnIndex) => {
            const transforms = columnTransforms[columnIndex]

            if (isMobile) {
              // Mobile: Show 5 videos per column
              const mobileVideos = getMobileColumnVideos(columnIndex)

              return (
                <div
                  key={columnIndex}
                  className="flex-1 h-full flex flex-col justify-center px-1 space-y-2"
                >
                  {mobileVideos.map((video, videoIndex) => {
                    // Get the mobile column index (0, 1, 2 for columns 1, 2, 3)
                    const mobileColumnIndex = [1, 2, 3].indexOf(columnIndex)
                    const blurTransform = mobileBlurTransforms[mobileColumnIndex]?.[videoIndex]
                    const opacityTransform = mobileOpacityTransforms[mobileColumnIndex]?.[videoIndex]

                    return (
                      <motion.div
                        key={`${columnIndex}-${videoIndex}`}
                        ref={(el) => {
                          if (mobileCardRefs.current[mobileColumnIndex]) {
                            mobileCardRefs.current[mobileColumnIndex][videoIndex] = el
                          }
                        }}
                        className="relative group cursor-pointer"
                        style={{
                          aspectRatio: '9/16',
                          width: '100%',
                          height: 'auto',
                          y: transforms.y,
                          scale: transforms.scale,
                          rotateZ: transforms.rotateZ,
                          opacity: opacityTransform || 1,
                          filter: blurTransform || 'blur(0px)'
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
                        ease: [0.215, 0.61, 0.355, 1],
                        delay: 0.1 * columnIndex + 0.05 * videoIndex,
                        type: "spring",
                        stiffness: 120,
                        damping: 25
                      }}
                    >
                      {/* Video Container */}
                      <div
                        className="w-full h-full rounded-xl overflow-hidden shadow-medium"
                        onClick={handleUserInteraction}
                        onTouchStart={handleUserInteraction}
                      >
                        <SharedVideo
                          videoId={video.videoId}
                          className="w-full h-full object-cover rounded-xl"
                          autoPlay={true}
                          muted
                          loop
                          controls={false}
                          isVisible={true}
                          startTime={video.startTime}
                          showPoster={true}
                          hidePlayButton={true}
                          onLoadComplete={() => {
                            console.debug(`Hero video ${video.videoId} ready for column ${columnIndex}, video ${videoIndex}`)
                          }}
                        />
                      </div>

                      {/* Subtle hover overlay for interactivity feedback */}
                      <motion.div
                        className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 rounded-xl pointer-events-none"
                        initial={false}
                        whileHover={{ opacity: 1 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      />
                    </motion.div>
                    )
                  })}
                </div>
              )
            } else {
              // Desktop: Show single video per column
              return (
                <div
                  key={columnIndex}
                  className="flex-1 h-full flex items-center justify-center px-2"
                >
                  <motion.div
                    className="relative group cursor-pointer"
                    style={{
                      aspectRatio: '9/16',
                      width: '100%',
                      height: 'auto',
                      y: transforms.y,
                      scale: transforms.scale,
                      rotateZ: transforms.rotateZ,
                      opacity: transforms.opacity,
                      filter: transforms.filter
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
                      ease: [0.215, 0.61, 0.355, 1],
                      delay: 0.1 * columnIndex,
                      type: "spring",
                      stiffness: 120,
                      damping: 25
                    }}
                  >
                    {/* Video Container */}
                    <div
                      className="w-full h-full rounded-xl overflow-hidden shadow-medium"
                      onClick={handleUserInteraction}
                      onTouchStart={handleUserInteraction}
                    >
                      <SharedVideo
                        videoId={videoIds[columnIndex]}
                        className="w-full h-full object-cover rounded-xl"
                        autoPlay={true}
                        muted
                        loop
                        controls={false}
                        isVisible={true}
                        startTime={videoStartTimes[columnIndex]}
                        showPoster={true}
                        hidePlayButton={true}
                        onLoadComplete={() => {
                          console.debug(`Hero video ${videoIds[columnIndex]} ready for column ${columnIndex}`)
                        }}
                      />
                    </div>

                    {/* Subtle hover overlay for interactivity feedback */}
                    <motion.div
                      className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 rounded-xl pointer-events-none"
                      initial={false}
                      whileHover={{ opacity: 1 }}
                      transition={{
                        duration: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    />
                  </motion.div>
                </div>
              )
            }
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