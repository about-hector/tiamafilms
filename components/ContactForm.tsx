'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { z } from 'zod'

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  budget: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Simulate API call - replace with your actual endpoint
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random success/failure for demo
          Math.random() > 0.1 ? resolve(true) : reject(new Error('Submission failed'))
        }, 2000)
      })

      setIsSubmitted(true)
      reset()
    } catch {
      setSubmitError('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h3 className="text-2xl font-oswald font-bold text-charcoal mb-2">Message Sent!</h3>
          <p className="text-dark-grey">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="mt-6 px-6 py-3 bg-charcoal text-cream font-oswald font-medium uppercase tracking-wider text-sm hover:bg-dark-grey transition-colors duration-200"
          >
            Send Another Message
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className="text-4xl md:text-6xl font-oswald font-bold text-charcoal mb-4 uppercase"
        >
          Let&apos;s Work Together
        </motion.h2>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
          className="text-lg text-dark-grey font-inter max-w-2xl mx-auto"
        >
          Ready to bring your vision to life? Get in touch and let&apos;s discuss your next project.
        </motion.p>
      </div>

      <motion.form
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Error Banner */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-700 text-sm font-medium">{submitError}</p>
          </motion.div>
        )}

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-oswald font-medium uppercase tracking-wider text-charcoal">
              Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className={`w-full px-4 py-3 border rounded-lg bg-white font-inter transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-warm-grey focus:ring-charcoal focus:border-charcoal'
              }`}
              placeholder="Your full name"
            />
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm font-medium"
              >
                {errors.name.message}
              </motion.p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-oswald font-medium uppercase tracking-wider text-charcoal">
              Email *
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className={`w-full px-4 py-3 border rounded-lg bg-white font-inter transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-warm-grey focus:ring-charcoal focus:border-charcoal'
              }`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm font-medium"
              >
                {errors.email.message}
              </motion.p>
            )}
          </div>

          {/* Company Field */}
          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-oswald font-medium uppercase tracking-wider text-charcoal">
              Company
            </label>
            <input
              {...register('company')}
              type="text"
              id="company"
              className="w-full px-4 py-3 border border-warm-grey rounded-lg bg-white font-inter transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-charcoal"
              placeholder="Your company name"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-oswald font-medium uppercase tracking-wider text-charcoal">
              Phone
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              className="w-full px-4 py-3 border border-warm-grey rounded-lg bg-white font-inter transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-charcoal"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* Budget Field */}
        <div className="space-y-2">
          <label htmlFor="budget" className="block text-sm font-oswald font-medium uppercase tracking-wider text-charcoal">
            Project Budget
          </label>
          <select
            {...register('budget')}
            id="budget"
            className="w-full px-4 py-3 border border-warm-grey rounded-lg bg-white font-inter transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-charcoal"
          >
            <option value="">Select budget range</option>
            <option value="under-10k">Under $10,000</option>
            <option value="10k-25k">$10,000 - $25,000</option>
            <option value="25k-50k">$25,000 - $50,000</option>
            <option value="50k-100k">$50,000 - $100,000</option>
            <option value="100k-plus">$100,000+</option>
          </select>
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <label htmlFor="subject" className="block text-sm font-oswald font-medium uppercase tracking-wider text-charcoal">
            Subject *
          </label>
          <input
            {...register('subject')}
            type="text"
            id="subject"
            className={`w-full px-4 py-3 border rounded-lg bg-white font-inter transition-all duration-200 focus:outline-none focus:ring-2 ${
              errors.subject
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-warm-grey focus:ring-charcoal focus:border-charcoal'
            }`}
            placeholder="What&apos;s your project about?"
          />
          {errors.subject && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm font-medium"
            >
              {errors.subject.message}
            </motion.p>
          )}
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-oswald font-medium uppercase tracking-wider text-charcoal">
            Message *
          </label>
          <textarea
            {...register('message')}
            id="message"
            rows={6}
            className={`w-full px-4 py-3 border rounded-lg bg-white font-inter transition-all duration-200 focus:outline-none focus:ring-2 resize-none ${
              errors.message
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-warm-grey focus:ring-charcoal focus:border-charcoal'
            }`}
            placeholder="Tell us about your project, timeline, and any specific requirements..."
          />
          {errors.message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm font-medium"
            >
              {errors.message.message}
            </motion.p>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center pt-4">
          <motion.button
            type="submit"
            disabled={isSubmitting || !isValid}
            whileHover={{ 
              scale: !isSubmitting && isValid ? 1.02 : 1,
              transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
            }}
            whileTap={{ scale: !isSubmitting && isValid ? 0.98 : 1 }}
            className={`px-12 py-4 font-oswald font-medium uppercase tracking-wider text-sm transition-all duration-200 ${
              isSubmitting || !isValid
                ? 'bg-warm-grey text-charcoal cursor-not-allowed'
                : 'bg-charcoal text-cream hover:bg-dark-grey'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v1a7 7 0 00-7 7h1z"/>
                </svg>
                <span>Sending...</span>
              </span>
            ) : (
              'Send Message'
            )}
          </motion.button>
        </div>

        {/* Form Info */}
        <div className="text-center pt-4 text-sm text-dark-grey">
          <p>We typically respond within 24 hours. For urgent inquiries, call us directly.</p>
        </div>
      </motion.form>
    </motion.div>
  )
}

export default ContactForm 