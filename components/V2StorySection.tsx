'use client'

import { motion } from 'framer-motion'
import { useRef, useEffect, useState, useCallback } from 'react'
import React from 'react'

interface VideoData {
  videoSrc: string
  thumbnailSrc: string
  alt: string
  startTime?: number
}

interface V2StorySectionProps {
  location: string
  venue: string
  coupleNames: string
  testimonial: string
  videos: VideoData[]
}

interface VideoThumbnailProps {
  videoSrc: string
  thumbnailSrc: string
  alt: string
  startTime?: number
  className?: string
  shouldPlay?: boolean
  index?: number
}

const VideoThumbnail = ({ videoSrc, startTime = 0, className = "", shouldPlay = true }: VideoThumbnailProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Play/pause video based on shouldPlay prop
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime
      if (shouldPlay) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [shouldPlay, startTime])

  return (
    <div className={`relative w-full h-full overflow-hidden bg-medium-grey shadow-lg rounded-lg ${className}`}>
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover rounded-lg"
        src={videoSrc}
        muted
        loop
        playsInline
      />
    </div>
  )
}

const InfiniteMarquee = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative overflow-hidden w-full">
      <div className="flex animate-marquee-seamless whitespace-nowrap">
        {/* Create enough duplicates for seamless loop */}
        <div className="flex items-center shrink-0">
          {children}
        </div>
        <div className="flex items-center shrink-0 ml-80">
          {children}
        </div>
        <div className="flex items-center shrink-0 ml-80">
          {children}
        </div>
        <div className="flex items-center shrink-0 ml-80">
          {children}
        </div>
      </div>
    </div>
  )
}

const V2StorySection = ({
  location,
  venue,
  coupleNames,
  testimonial,
  videos
}: V2StorySectionProps) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.95) {
        const index = (entry.target as HTMLElement).dataset.index
        if (index) {
          setCurrentVideoIndex(parseInt(index, 10))
        }
      }
    })
  }, [])

  useEffect(() => {
    if (!carouselRef.current) return

    const observerOptions = {
      root: carouselRef.current, // Scope to this component's carousel
      rootMargin: '-10px', // Require some margin from edges
      threshold: 0.95, // 95% of the video needs to be in view
    }

    const intersectionObserver = new IntersectionObserver(handleIntersection, observerOptions)
    // Only select video thumbnails within this component
    const videoElements = carouselRef.current.querySelectorAll('.video-thumbnail')
    
    videoElements.forEach((videoElement, index) => {
      (videoElement as HTMLElement).dataset.index = index.toString()
      intersectionObserver.observe(videoElement)
    })

    return () => {
      intersectionObserver.disconnect()
    }
  }, [handleIntersection])

  return (
    <section className="relative w-full bg-white py-20 md:py-32">
      {/* Main Container */}
      <div className="relative z-10 w-full flex flex-col">
        
        {/* Location Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className="text-center pb-6 md:pb-12"
        >
          <p className="text-sm font-oswald font-medium uppercase tracking-[0.3em] text-dark-grey mb-2">
            {location}
          </p>
          <h3 className="text-lg font-oswald font-semibold uppercase tracking-[0.2em] text-charcoal">
            {venue}
          </h3>
        </motion.div>

        {/* Infinite Marquee with Names */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="py-6 md:py-12"
        >
          <InfiniteMarquee>
            <span className="text-4xl md:text-5xl lg:text-6xl font-oswald font-bold uppercase tracking-wider text-charcoal">
              {coupleNames}
            </span>
          </InfiniteMarquee>
        </motion.div>

        {/* Video Grid - Desktop: 3 column grid, Mobile: Horizontal carousel */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-8 md:px-16 py-8 md:py-16"
        >
          <div className="max-w-7xl mx-auto">
            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-8">
              {videos.map((video, index) => {
                // Create scattered delays for more dynamic animation
                const scatteredDelays = [0.1, 0.35, 0.15, 0.25, 0.05, 0.3]
                const delay = scatteredDelays[index % scatteredDelays.length]
                
                return (
                  <motion.div
                    key={index}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay }}
                    className="w-full"
                    style={{ aspectRatio: '9/16' }}
                  >
                    <VideoThumbnail
                      videoSrc={video.videoSrc}
                      thumbnailSrc={video.thumbnailSrc}
                      alt={video.alt}
                      startTime={video.startTime}
                      shouldPlay={true}
                      index={index}
                      className="w-full h-full cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                    />
                  </motion.div>
                )
              })}
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden -mx-8">
              <div 
                ref={carouselRef}
                className="overflow-x-auto overflow-y-hidden scrollbar-hide pl-8"
                style={{ height: 'calc(280px * 16/9)' }} // Fixed height to prevent vertical scroll
              >
                <div className="flex space-x-4 h-full pr-8" style={{ width: `${videos.length * 280 + (videos.length - 1) * 16 + 32}px` }}>
                  {videos.map((video, index) => {
                    const scatteredDelays = [0.1, 0.35, 0.15, 0.25, 0.05, 0.3]
                    const delay = scatteredDelays[index % scatteredDelays.length]
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay }}
                        className="video-thumbnail flex-shrink-0"
                        style={{ width: '280px', aspectRatio: '9/16' }}
                        data-index={index}
                      >
                        <VideoThumbnail
                          videoSrc={video.videoSrc}
                          thumbnailSrc={video.thumbnailSrc}
                          alt={video.alt}
                          startTime={video.startTime}
                          shouldPlay={index === currentVideoIndex}
                          index={index}
                          className="w-full h-full cursor-pointer"
                        />
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonial Section - only show if testimonial exists */}
        {testimonial && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="px-8 md:px-16 pt-8 pb-4"
          >
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-8 h-px bg-warm-grey"></div>
                <cite className="text-xs font-oswald uppercase tracking-[0.2em] not-italic text-charcoal">
                  SPOUSES KIND WORDS
                </cite>
                <div className="w-8 h-px bg-warm-grey"></div>
              </div>
              <blockquote className="text-sm md:text-base text-dark-grey font-inter leading-relaxed">
                &ldquo;{testimonial}&rdquo;
              </blockquote>
            </div>
          </motion.div>
        )}

      </div>
    </section>
  )
}

export default V2StorySection 