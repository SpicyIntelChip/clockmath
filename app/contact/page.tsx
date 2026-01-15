'use client';

import { useState, useEffect, useCallback } from 'react';
import PageChrome from '@/components/PageChrome';
import SiteFooter from '@/components/SiteFooter';
import { generateSEOMetadata } from '@/lib/seo';
import { event as gaEvent } from '@/lib/gtag';
import JsonLd, { getFAQPageSchema } from '@/components/JsonLd';

export default function ContactPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Anti-spam measures
  const [honeypot, setHoneypot] = useState('');
  const [startTime] = useState(Date.now());
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('clockmath-darkmode');
    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === 'true');
    } else {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('clockmath-darkmode', next.toString());
      return next;
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Track user interaction for anti-spam
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Anti-spam checks
    try {
      // 1. Honeypot check - if filled, it's likely a bot
      if (honeypot.trim() !== '') {
        console.log('Spam detected: honeypot filled');
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      // 2. Time-based check - too fast submissions are likely bots (minimum 3 seconds)
      const timeTaken = Date.now() - startTime;
      if (timeTaken < 3000) {
        console.log('Spam detected: submission too fast');
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      // 3. Basic interaction check
      if (!hasInteracted) {
        console.log('Spam detected: no user interaction');
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      // 4. Content validation - check for spam patterns
      const spamKeywords = ['bitcoin', 'crypto', 'seo service', 'link building', 'viagra', 'casino', 'loan', 'investment opportunity'];
      const messageText = formData.message.toLowerCase();
      const hasSpamContent = spamKeywords.some(keyword => messageText.includes(keyword));
      
      if (hasSpamContent) {
        console.log('Spam detected: spam keywords found');
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      // 5. Check for excessive URLs (more than 2 URLs is suspicious)
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = messageText.match(urlRegex) || [];
      if (urls.length > 2) {
        console.log('Spam detected: too many URLs');
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      // 6. Email validation - check for valid email format and suspicious patterns
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        console.log('Spam detected: invalid email format');
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      // Check for suspicious email patterns
      const suspiciousEmailPatterns = ['.ru', '.tk', '.ml', 'temp-mail', 'guerrillamail', '10minutemail'];
      const emailLower = formData.email.toLowerCase();
      const hasSuspiciousEmail = suspiciousEmailPatterns.some(pattern => emailLower.includes(pattern));
      
      if (hasSuspiciousEmail) {
        console.log('Spam detected: suspicious email domain');
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      // 7. Rate limiting - check localStorage for recent submissions
      const lastSubmission = localStorage.getItem('last-contact-submission');
      if (lastSubmission) {
        const timeSinceLastSubmission = Date.now() - parseInt(lastSubmission);
        const minInterval = 5 * 60 * 1000; // 5 minutes minimum between submissions
        
        if (timeSinceLastSubmission < minInterval) {
          console.log('Spam detected: too frequent submissions');
          setSubmitStatus('error');
          setIsSubmitting(false);
          return;
        }
      }
      // Create mailto link
      const subject = encodeURIComponent(
        formData.category 
          ? `[${formData.category}] ${formData.subject}`
          : formData.subject
      );
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      );
      
      const mailtoLink = `mailto:hello@clockmath.com?subject=${subject}&body=${body}`;
      
      // Open mail client
      window.location.href = mailtoLink;
      
      // Track the contact attempt
      gaEvent({
        action: 'contact_form_submitted',
        params: {
          category: formData.category,
          has_subject: Boolean(formData.subject),
          device: window.matchMedia?.('(pointer: coarse)')?.matches ? 'mobile' : 'desktop'
        }
      });

      // Store submission timestamp for rate limiting
      localStorage.setItem('last-contact-submission', Date.now().toString());

      setSubmitStatus('success');
      
      // Reset form after short delay
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: ''
        });
        setSubmitStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      question: "How accurate are the time calculations?",
      answer: "Our calculations are precise to the second and account for daylight saving time changes automatically."
    },
    {
      question: "Can I use ClockMath for business purposes?",
      answer: "Absolutely! ClockMath is free for both personal and commercial use."
    },
    {
      question: "Do you have an API for developers?",
      answer: "We're currently developing an API. Contact us if you're interested in early access."
    },
    {
      question: "How do I report a bug or suggest a feature?",
      answer: "Use the form below with 'Bug Report' or 'Feature Request' as the category."
    }
  ];

  return (
    <PageChrome currentTool="articles" onToggleTheme={toggleDarkMode} isDarkMode={isDarkMode}>
      <JsonLd data={getFAQPageSchema(faqItems)} />
      {/* Header */}
      <header className="text-center mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-lg border border-slate-700 dark:border-slate-600">
              {/* Contact/Mail icon */}
              <svg width="80" height="80" viewBox="0 0 80 80" className="w-12 sm:w-16 h-12 sm:h-16">
                <rect x="10" y="20" width="60" height="40" rx="6" fill="white" stroke="#1e293b" strokeWidth="1" />
                
                {/* Envelope flap */}
                <path d="M10 20 L40 45 L70 20" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Clock symbol on envelope */}
                <circle cx="55" cy="35" r="8" fill="#0f172a" />
                <circle cx="55" cy="35" r="7" fill="white" stroke="#1e293b" strokeWidth="0.5" />
                <path d="M55 31v4l3 3" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="55" cy="35" r="1" fill="#1e293b" />
                
                {/* Question mark accent */}
                <text x="25" y="50" textAnchor="middle" className="text-lg font-bold fill-blue-600">
                  ?
                </text>
              </svg>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">Get</span>{" "}
              <span className="text-blue-600 dark:text-blue-400">Help</span>
            </h1>
            <p className="text-slate-700 dark:text-emerald-200 text-base sm:text-lg font-medium">
              Questions, feedback, or feature requests
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <a href="/" className="hover:text-primary transition-colors">
            ClockMath
          </a>
          <span className="mx-2">›</span>
          <span>Contact</span>
        </nav>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* FAQ Section */}
        <section className="bg-card/70 dark:bg-slate-800/70 rounded-2xl p-6 sm:p-8 shadow-xl border border-border/50 dark:border-slate-700/50">
          <h2 className="text-2xl font-bold text-foreground dark:text-slate-100 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details key={index} className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.question}
                    </h3>
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <div className="px-4 py-3 text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-b-lg border-x border-b border-slate-200 dark:border-slate-600 -mt-1">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-card/70 dark:bg-slate-800/70 rounded-2xl p-6 sm:p-8 shadow-xl border border-border/50 dark:border-slate-700/50">
          <h2 className="text-2xl font-bold text-foreground dark:text-slate-100 mb-6">
            Send Message
          </h2>
          
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-emerald-800 dark:text-emerald-200">
                ✅ Your email client should have opened. If not, you can email us directly at{' '}
                <a href="mailto:hello@clockmath.com" className="underline hover:no-underline">
                  hello@clockmath.com
                </a>
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">
                ❌ Unable to process your message. Please try again or email us directly at{' '}
                <a href="mailto:hello@clockmath.com" className="underline hover:no-underline">
                  hello@clockmath.com
                </a>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field - hidden from users but visible to bots */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
              <label htmlFor="website">Website (leave blank)</label>
              <input
                type="text"
                id="website"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground dark:text-slate-100 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background dark:bg-slate-700 border border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground dark:text-slate-100 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background dark:bg-slate-700 border border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground dark:text-slate-100 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-background dark:bg-slate-700 border border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              >
                <option value="">Select a category</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="General Question">General Question</option>
                <option value="Business Inquiry">Business Inquiry</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground dark:text-slate-100 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-background dark:bg-slate-700 border border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                placeholder="Brief description of your message"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground dark:text-slate-100 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-background dark:bg-slate-700 border border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                placeholder="Tell us more about your question or feedback..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.message}
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:from-muted disabled:to-muted disabled:text-muted-foreground text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Opening Email Client...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Message
                </>
              )}
            </button>
          </form>

        </section>
      </div>

      <SiteFooter />
    </PageChrome>
  );
}
