/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Clock Math",
  description: "Terms of Service for ClockMath.com time duration calculator. Learn about usage rights, limitations, and legal information.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://clockmath.com/terms",
  },
  openGraph: {
    title: "Terms of Service — Clock Math",
    description: "Terms of Service for ClockMath.com time duration calculator.",
    type: "website",
    url: "https://clockmath.com/terms",
    siteName: "Clock Math",
  },
  twitter: {
    card: "summary",
  },
};

export default function TermsPage() {
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
            ⚖️ Terms of Service
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
              Welcome to ClockMath.com ("we," "our," or "us"). By using this website, you agree to the following Terms of Service. Please read them carefully.
            </p>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">1. Use of the Site</h2>
            <p className="mb-4">
              ClockMath.com provides a free online calculator to help users calculate time durations.
            </p>
            <ul className="mb-6">
              <li>You may use the site for personal or professional purposes.</li>
              <li>You agree not to misuse the site or attempt to interfere with its functionality.</li>
            </ul>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">2. No Warranties</h2>
            <p className="mb-4">
              This website and its content are provided "as is" without warranties of any kind, either express or implied.
            </p>
            <ul className="mb-6">
              <li>We make no guarantees regarding accuracy, availability, or fitness for a particular purpose.</li>
              <li>While we strive to provide accurate results, the calculator should not be relied upon for legal, medical, financial, or critical decision-making purposes.</li>
            </ul>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">3. Limitation of Liability</h2>
            <p className="mb-4">
              To the fullest extent permitted by law, ClockMath.com and its operators are not liable for any damages or losses arising from the use of this site, including but not limited to:
            </p>
            <ul className="mb-6">
              <li>Errors or inaccuracies in calculations</li>
              <li>Downtime, bugs, or interruptions in service</li>
              <li>Third-party links or content accessed through the site</li>
            </ul>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p className="mb-4">
              All content on ClockMath.com (text, layout, design) is owned by ClockMath or its content providers.
            </p>
            <ul className="mb-6">
              <li>You may not copy, reproduce, or distribute site content without permission, except for personal use.</li>
            </ul>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <p className="mb-6">
              ClockMath.com uses Google Analytics and Google Search Console to analyze traffic. By using the site, you acknowledge that your usage data may be collected in accordance with our Privacy Policy.
            </p>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">6. Changes to These Terms</h2>
            <p className="mb-6">
              We may update these Terms of Service from time to time. Continued use of the site after changes are posted means you accept the revised terms.
            </p>

            <hr className="my-6 border-border/50 dark:border-slate-700/50" />

            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="mb-6">
              If you have questions about these Terms, please contact us at{" "}
              <a 
                href="mailto:hello@clockmath.com" 
                className="text-primary hover:text-primary/80 underline"
              >
                hello@clockmath.com
              </a>.
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
