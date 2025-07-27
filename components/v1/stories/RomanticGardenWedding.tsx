'use client'

import { motion, MotionValue } from 'framer-motion'
import { useState, useRef } from 'react'

interface RomanticGardenWeddingProps {
  scrollProgress: MotionValue<number>
  startRange: number
  endRange: number
  isActive: boolean
}

interface VideoThumbnailProps {
  videoSrc: string
  thumbnailSrc: string
  alt: string
  startTime?: number
  className?: string
}

const VideoThumbnail = ({ videoSrc, alt, startTime = 0, className = "" }: VideoThumbnailProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (videoRef.current) {
      videoRef.current.currentTime = startTime
      videoRef.current.play()
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  return (
    <div 
      className={`relative overflow-hidden bg-light-grey/50 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 9:16 Aspect Ratio Container with Margins */}
      <div className="flex items-center justify-center h-full p-4 md:p-6 lg:p-8">
        <div 
          className="relative w-full bg-medium-grey overflow-hidden rounded-lg shadow-lg"
          style={{ aspectRatio: '9/16', maxHeight: '85%' }}
        >
          {/* Thumbnail Image */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-warm-grey/20 to-dark-grey/40 flex items-center justify-center">
              <div className="text-center text-dark-grey">
                <div className="w-12 h-12 bg-warm-grey/40 rounded-full mb-4 mx-auto flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-oswald uppercase tracking-wide">{alt}</p>
              </div>
            </div>
          </div>

          {/* Video */}
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            src={videoSrc}
            muted
            loop
            playsInline
          />
          
          {/* Play indicator */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* 9:16 Ratio Label */}
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-oswald uppercase tracking-wide px-2 py-1 rounded">
        9:16
      </div>
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

const RomanticGardenWedding = ({}: RomanticGardenWeddingProps) => {
  const videos = [
    {
      videoSrc: "/videos/garden-wedding-ceremony.mp4",
      thumbnailSrc: "/stories/garden-wedding-main.jpg",
      alt: "Ceremony Highlights",
      startTime: 10
    },
    {
      videoSrc: "/videos/garden-wedding-details.mp4", 
      thumbnailSrc: "/stories/garden-wedding-details-1.jpg",
      alt: "Wedding Details",
      startTime: 5
    },
    {
      videoSrc: "/videos/garden-wedding-reception.mp4",
      thumbnailSrc: "/stories/garden-wedding-details-2.jpg",
      alt: "Reception Moments",
      startTime: 15
    }
  ]

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Main Container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        
        {/* Location Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className="text-center pt-12 pb-8"
        >
          <p className="text-sm font-oswald font-medium uppercase tracking-[0.3em] text-dark-grey mb-2">
            TUSCANY
          </p>
          <h3 className="text-lg font-oswald font-semibold uppercase tracking-[0.2em] text-charcoal">
            BOTANICAL GARDENS ESTATE
          </h3>
        </motion.div>

        {/* Infinite Marquee with Names */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="py-8"
        >
          <InfiniteMarquee>
            <span className="text-4xl md:text-5xl lg:text-6xl font-oswald font-bold uppercase tracking-wider text-charcoal">
              SARAH + MICHAEL
            </span>
          </InfiniteMarquee>
        </motion.div>

        {/* Video Grid */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex-1 px-8 md:px-16 py-12"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
              {videos.map((video, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 * index + 0.6 }}
                  className="h-full"
                >
                  <VideoThumbnail
                    videoSrc={video.videoSrc}
                    thumbnailSrc={video.thumbnailSrc}
                    alt={video.alt}
                    startTime={video.startTime}
                    className="w-full h-full cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="px-8 md:px-16 pb-12"
        >
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="text-lg md:text-xl text-dark-grey font-inter italic leading-relaxed mb-6">
              &ldquo;Honestly have been sobbing happy tears all evening. Wow, you are true artists!!!!!!!!! You have made us see our wedding in a light we didn&apos;t even think possible, purely artistic, emotional, incredible. We are eternally grateful ❤️&rdquo;
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-8 h-px bg-warm-grey"></div>
              <cite className="text-sm font-oswald uppercase tracking-wider not-italic text-charcoal">
                SPOUSES KIND WORDS
              </cite>
              <div className="w-8 h-px bg-warm-grey"></div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default RomanticGardenWedding 