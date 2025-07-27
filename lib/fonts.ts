import { Inter, Playfair_Display, Montserrat, Oswald } from 'next/font/google'

// Primary font for body text - clean and modern
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Luxury serif font for headings
export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// Sans-serif for UI elements and secondary text
export const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

// Bold, condensed font for headers and impact text
export const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700'],
}) 