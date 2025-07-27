'use client'

import { motion, useTransform, MotionValue } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface StoryModuleProps {
  title: string
  subtitle: string
  description: string
  images: Array<{
    src: string
    alt: string
    aspectRatio?: string
  }>
  children?: ReactNode
  scrollProgress: MotionValue<number> // From framer-motion useScroll
  startRange: number // When to start fade in (0-1)
  endRange: number // When to start fade out (0-1)
  isActive: boolean // Whether this story is currently active
}

const StoryModule = ({
  title,
  subtitle,
  description,
  images,
  children,
  scrollProgress,
  startRange,
  endRange
}: StoryModuleProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Calculate fade and scale values based on scroll position
  const fadeIn = startRange
  const fadeOut = endRange
  const activeStart = startRange + 0.02
  const activeEnd = endRange - 0.02
  
  // Transform values for smooth transitions
  const opacity = useTransform(
    scrollProgress, 
    [fadeIn, activeStart, activeEnd, fadeOut], 
    [0, 1, 1, 0]
  )
  
  const scale = useTransform(
    scrollProgress,
    [fadeIn, activeStart, activeEnd, fadeOut],
    [0.95, 1, 1, 0.95]
  )
  
  const blur = useTransform(
    scrollProgress,
    [fadeIn, activeStart, activeEnd, fadeOut],
    ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(8px)']
  )
  
  const y = useTransform(
    scrollProgress,
    [fadeIn, activeStart, activeEnd, fadeOut],
    [50, 0, 0, -50]
  )

  return (
    <motion.div
      ref={containerRef}
      className="story-module relative w-full h-screen bg-cream snap-start snap-always overflow-hidden flex items-center justify-center"
      style={{
        opacity,
        scale,
        filter: blur,
        y,
      }}
    >
      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-4 h-full w-full gap-4 p-8">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="bg-charcoal/10 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-12 md:px-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[80vh] py-8">
          {/* Content Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
            className="space-y-10"
          >
            <div>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm md:text-base font-oswald font-medium uppercase tracking-wider text-warm-grey mb-4"
              >
                {subtitle}
              </motion.p>
              
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-4xl md:text-6xl lg:text-7xl font-oswald font-bold text-charcoal mb-8 uppercase leading-tight"
              >
                {title}
              </motion.h2>
            </div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg md:text-xl text-dark-grey font-inter leading-relaxed"
            >
              {description}
            </motion.p>

            {children && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {children}
              </motion.div>
            )}

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-charcoal text-cream font-oswald font-semibold uppercase tracking-wider text-sm rounded-none hover:bg-dark-grey transition-colors duration-300 group"
            >
              View Full Story
              <svg 
                className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Images Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.1 * index + 0.3 }}
                  className={`relative overflow-hidden rounded-lg bg-medium-grey group cursor-pointer ${
                    index === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-[4/5]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Placeholder for now - will be replaced with actual images */}
                  <div className="absolute inset-0 bg-gradient-to-br from-warm-grey/20 to-dark-grey/40 flex items-center justify-center">
                    <div className="text-center text-dark-grey">
                      <div className="w-12 h-12 bg-warm-grey/40 rounded-full mb-4 mx-auto flex items-center justify-center">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm font-oswald uppercase tracking-wide">{image.alt}</p>
                    </div>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>

            {/* Decorative element */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -top-6 -right-6 w-24 h-24 border-2 border-warm-grey/30 rounded-full"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default StoryModule 