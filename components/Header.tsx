'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface HeaderProps {
  className?: string
}

const Header = ({ className = "" }: HeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.215, 0.61, 0.355, 1] // ease-out-cubic from animations.mdc
      }}
      className={`absolute top-0 left-0 right-0 z-20 p-6 md:p-8 ${className}`}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-oswald font-bold text-charcoal tracking-wide uppercase">
          TiamaFilms
        </h1>
        <nav className="hidden md:flex space-x-8 text-sm text-charcoal/80 font-oswald font-medium uppercase tracking-wider">
          <a href="#" className="hover:text-charcoal transition-colors duration-200 ease-out">
            About
          </a>
          <a href="#" className="hover:text-charcoal transition-colors duration-200 ease-out">
            Contact
          </a>
        </nav>
      </div>
    </motion.header>
  )
}

export default Header 