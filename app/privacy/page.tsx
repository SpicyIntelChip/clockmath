/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Clock Math",
  description: "Privacy Policy for ClockMath.com time duration calculator. Learn how we protect your privacy and handle data collection.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://clockmath.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy — Clock Math",
    description: "Privacy Policy for ClockMath.com time duration calculator.",
    type: "website",
    url: "https://clockmath.com/privacy",
    siteName: "Clock Math",
  },
  twitter: {
    card: "summary",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Calculator
          </Link>
          <h1 className="text-4xl font-bold text-foreground dark:text-slate-100 mb-2">
            🛡️ Privacy Policy
          </h1>
          <p className="text-muted-foreground dark:text-slate-400">
            ClockMath.com
          </p>
        </div>

        {/* Content */}
        <div className="bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-border/50 dark:border-slate-700/50">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-sm text-muted-foreground dark:text-slate-400 mb-6">
              <strong>Effective Date:</strong> January 15, 2025
            </p>

            <p className="mb-6">
              At ClockMath.com, we respect your privacy. This policy explains what information we collect, how it's used, and your choices regarding data.
            </p>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We do not collect personally identifiable information (such as names, emails, or payment details).
            </p>
            <p className="mb-4">
              Through Google Analytics and Google Search Console, we collect limited, non-personal information to understand how our website is used, including:
            </p>
            <ul className="mb-6">
              <li>Pages visited and time spent on the site</li>
              <li>Device type, browser, and operating system</li>
              <li>General location (city-level, anonymized IP)</li>
              <li>Traffic sources (e.g., search engines, social media, direct visits)</li>
            </ul>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">2. How We Use This Information</h2>
            <p className="mb-4">We use this data only to:</p>
            <ul className="mb-4">
              <li>Monitor site performance</li>
              <li>Improve the user experience of the calculator</li>
              <li>Understand what content and features are most helpful</li>
              <li>Identify general traffic trends (e.g., mobile vs desktop users)</li>
            </ul>
            <p className="mb-6">
              This information is analyzed in aggregate form. We do not sell or share visitor data with third parties.
            </p>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">3. Google Analytics & Search Console</h2>
            <p className="mb-4">
              ClockMath uses Google Analytics and Search Console to track and analyze website traffic. We have enabled the following baseline features:
            </p>
            <ul className="mb-4">
              <li>IP anonymization (your full IP address is never stored)</li>
              <li>Basic engagement tracking (page views, sessions, bounce rate, device type)</li>
              <li>Search performance reporting (keywords that bring visitors to the site)</li>
            </ul>
            <p className="mb-4">
              We have not enabled advertising features, remarketing, or user ID tracking.
            </p>
            <p className="mb-6">
              You can opt out of Google Analytics tracking by installing the{" "}
              <a 
                href="https://tools.google.com/dlpage/gaoptout" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline"
              >
                Google Analytics Opt-Out Browser Add-On
              </a>.
            </p>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">4. Cookies</h2>
            <p className="mb-4">
              ClockMath uses cookies only to support basic analytics tracking. Cookies are small files stored on your device that help us understand how visitors interact with the site.
            </p>
            <p className="mb-6">
              You may disable cookies in your browser settings, though some features of the site may not function as intended.
            </p>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Links</h2>
            <p className="mb-6">
              Our site may link to external websites. We are not responsible for the privacy practices of third parties.
            </p>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="mb-4">
              Depending on your location, you may have the right to request:
            </p>
            <ul className="mb-4">
              <li>Access to the data collected about you</li>
              <li>Deletion of your data</li>
              <li>Opting out of tracking</li>
            </ul>
            <p className="mb-6">
              To make a request, contact us at{" "}
              <a 
                href="mailto:hello@clockmath.com" 
                className="text-primary hover:text-primary/80 underline"
              >
                hello@clockmath.com
              </a>.
            </p>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">7. Updates</h2>
            <p className="mb-6">
              We may update this Privacy Policy from time to time. Updates will be posted here with a new effective date.
            </p>
          </div>
        </div>

        {/* Back to Calculator CTA */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Use Time Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}
