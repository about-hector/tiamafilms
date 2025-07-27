'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import LoadingScreen from '@/components/LoadingScreen'
import StoryScrollWrapper from '@/components/StoryScrollWrapper'
import MasonryStoryModule from '@/components/MasonryStoryModule'
import RomanticGardenWedding from '@/components/stories/RomanticGardenWedding'
import ModernCityWedding from '@/components/stories/ModernCityWedding'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />
  }

  return (
    <motion.main 
      className="relative w-screen min-h-screen main-content-fade"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 1,
        ease: [0.215, 0.61, 0.355, 1],
        delay: 0.2 // Small delay to ensure smooth transition from loading screen
      }}
    >
      {/* Story Section with integrated normal content */}
      <StoryScrollWrapper 
        normalContent={
          <>
            {/* About Us Section */}
            <section className="relative w-full min-h-screen bg-cream">
          <div className="min-h-screen flex flex-col justify-center px-8 md:px-16 py-16">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-16">
                <motion.h2
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
                  className="text-4xl md:text-6xl font-oswald font-bold text-charcoal mb-6 uppercase"
                >
                  About Us
                </motion.h2>
                <motion.p
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
                  className="text-lg md:text-xl text-dark-grey font-inter leading-relaxed max-w-3xl mx-auto"
                >
                  We are a passionate team of storytellers dedicated to capturing the most beautiful moments of your life with cinematic artistry and timeless elegance.
                </motion.p>
              </div>

              {/* Team Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {[
                  { name: "Creative Director", role: "Cinematography & Direction", image: "/team/member-1.jpg" },
                  { name: "Lead Videographer", role: "Cinematography & Editing", image: "/team/member-2.jpg" },
                  { name: "Photography Director", role: "Photography & Composition", image: "/team/member-3.jpg" },
                  { name: "Post-Production Lead", role: "Editing & Color Grading", image: "/team/member-4.jpg" }
                ].map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, delay: 0.1 * index, ease: [0.215, 0.61, 0.355, 1] }}
                    className="group"
                  >
                    <div className="relative mb-6 overflow-hidden rounded-lg bg-medium-grey aspect-[3/4]">
                      {/* Placeholder for team member image */}
                      <div className="absolute inset-0 bg-gradient-to-br from-warm-grey/20 to-dark-grey/40 flex items-center justify-center">
                        <div className="text-center text-dark-grey">
                          <div className="w-16 h-16 bg-warm-grey/40 rounded-full mb-4 mx-auto flex items-center justify-center">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-sm font-oswald uppercase tracking-wide">Team Photo</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-oswald font-semibold text-lg text-charcoal mb-2 uppercase tracking-wide">
                        {member.name}
                      </h3>
                      <p className="text-dark-grey font-inter text-sm">
                        {member.role}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Group Photo Section */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
                className="text-center"
              >
                <h3 className="font-oswald font-semibold text-2xl text-charcoal mb-8 uppercase tracking-wide">
                  The TiamaFilms Team
                </h3>
                <div className="relative mx-auto max-w-4xl overflow-hidden rounded-lg bg-medium-grey aspect-[16/9]">
                  {/* Placeholder for group photo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-warm-grey/20 to-dark-grey/40 flex items-center justify-center">
                    <div className="text-center text-dark-grey">
                      <div className="w-20 h-20 bg-warm-grey/40 rounded-full mb-6 mx-auto flex items-center justify-center">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                        </svg>
                      </div>
                      <p className="text-lg font-oswald uppercase tracking-wide">Team Group Photo</p>
                    </div>
                  </div>
                </div>
                <motion.p
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
                  className="mt-8 text-lg text-dark-grey font-inter leading-relaxed max-w-2xl mx-auto"
                >
                  Together, we bring years of experience and an unwavering commitment to excellence, 
                  ensuring every moment of your special day is captured with the artistry it deserves.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="relative w-full min-h-screen bg-white flex items-center justify-center px-8 md:px-16 py-16">
          <ContactForm />
        </section>

        {/* Footer Section */}
        <Footer />
          </>
        }
      >
        <MasonryStoryModule />
        <RomanticGardenWedding 
          scrollProgress={null}
          startRange={0}
          endRange={1}
          isActive={false}
        />
        <ModernCityWedding 
          scrollProgress={null}
          startRange={0}
          endRange={1}
          isActive={false}
        />
      </StoryScrollWrapper>
    </motion.main>
  )
}
