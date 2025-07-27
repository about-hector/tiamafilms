'use client'

const Footer = () => {
  return (
    <footer className="bg-light-grey py-16 md:py-24 px-8 md:px-16 border-t border-warm-grey/30">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-16">
          
          {/* Company Info */}
          <div className="space-y-6">
            <h2 className="font-oswald font-bold text-4xl md:text-5xl text-charcoal uppercase tracking-tight">
              TIAMAFILMS
            </h2>
            <p className="text-dark-grey font-inter leading-relaxed">
              Crafting cinematic narratives for life&apos;s most precious chapters. 
              Luxury wedding videography with unparalleled artistry and elegance.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="font-oswald font-semibold text-lg text-charcoal uppercase tracking-wide">
              Contact
            </h3>
            <div className="space-y-3 text-dark-grey font-inter">
              <div>
                <p className="font-medium">Email</p>
                <a 
                  href="mailto:hello@tiamafilms.com" 
                  className="hover:text-charcoal transition-colors duration-200"
                >
                  hello@tiamafilms.com
                </a>
              </div>
              <div>
                <p className="font-medium">Phone</p>
                <a 
                  href="tel:+15551234567" 
                  className="hover:text-charcoal transition-colors duration-200"
                >
                  +1 (555) 123-4567
                </a>
              </div>
              <div>
                <p className="font-medium">Address</p>
                <p>125 Wedding Lane<br />Beverly Hills, CA 90210</p>
              </div>
            </div>
          </div>

          {/* Services & Social */}
          <div className="space-y-6">
            <h3 className="font-oswald font-semibold text-lg text-charcoal uppercase tracking-wide">
              Follow
            </h3>
            <div className="space-y-3">
              <a 
                href="#" 
                className="block text-dark-grey hover:text-charcoal transition-colors duration-200 font-inter"
              >
                Instagram
              </a>
              <a 
                href="#" 
                className="block text-dark-grey hover:text-charcoal transition-colors duration-200 font-inter"
              >
                Vimeo
              </a>
              <a 
                href="#" 
                className="block text-dark-grey hover:text-charcoal transition-colors duration-200 font-inter"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-12 border-t border-warm-grey/30 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
          <div className="text-sm text-dark-grey font-oswald font-medium uppercase tracking-wide">
            <p>©2025 TIAMAFILMS - ALL RIGHTS RESERVED</p>
          </div>
          <div className="text-sm text-dark-grey font-inter text-right">
            <p className="mb-1 text-warm-grey font-oswald font-medium uppercase tracking-wide">Website by</p>
            <p className="font-oswald font-bold uppercase tracking-wide text-charcoal">
              UNLOST STUDIO
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 