'use client';

import { useState, useEffect, useCallback } from 'react';
import { TimezoneConverter } from '@/components/TimezoneConverter';
import SiteFooter from '@/components/SiteFooter';
import ToolsNavigation from '@/components/ToolsNavigation';
import Link from 'next/link';
import { Toaster } from '@/components/ui/toaster';

export default function TimezonePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("clockmath-darkmode");
    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === "true");
    } else {
      // Check system preference
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("clockmath-darkmode", newDarkMode.toString());
  }, [isDarkMode]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/20">
      <Toaster />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(5,150,105,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(5,150,105,0.2),transparent_50%)]" />
      
      <main className="relative max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm text-foreground dark:text-slate-200 rounded-xl hover:bg-card dark:hover:bg-slate-700 transition-all duration-200 shadow-lg border border-border/50 dark:border-slate-700/50"
                title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              >
                {isDarkMode ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    Light Mode
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                    Dark Mode
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-lg border border-slate-700 dark:border-slate-600">
                {/* Globe icon - updated to match clock icon sizing */}
                <svg width="80" height="80" viewBox="0 0 80 80" className="w-12 sm:w-16 h-12 sm:h-16">
                  <circle cx="40" cy="40" r="39.5" fill="white" stroke="#1e293b" strokeWidth="1" />
                  
                  {/* Globe meridians */}
                  <ellipse cx="40" cy="40" rx="20" ry="39" fill="none" stroke="#059669" strokeWidth="2" />
                  <ellipse cx="40" cy="40" rx="10" ry="39" fill="none" stroke="#059669" strokeWidth="1.5" />
                  <ellipse cx="40" cy="40" rx="30" ry="39" fill="none" stroke="#059669" strokeWidth="1.5" />
                  
                  {/* Globe latitudes */}
                  <ellipse cx="40" cy="40" rx="39" ry="20" fill="none" stroke="#059669" strokeWidth="2" />
                  <ellipse cx="40" cy="40" rx="39" ry="10" fill="none" stroke="#059669" strokeWidth="1.5" />
                  
                  {/* Clock hands */}
                  <line x1="40" y1="40" x2="40" y2="25" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
                  <line x1="40" y1="40" x2="52" y2="40" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Center dot */}
                  <circle cx="40" cy="40" r="2" fill="#1e293b" />
                  
                  {/* Timezone indicators */}
                  <text x="58" y="28" textAnchor="middle" className="text-xs font-bold fill-amber-500">
                    🌍
                  </text>
                </svg>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Timezone</span>{" "}
                <span className="text-blue-600 dark:text-blue-400">Converter</span>
              </h1>
              <p className="text-slate-700 dark:text-emerald-200 text-base sm:text-lg font-medium">
                Convert time between any timezone
              </p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              ClockMath
            </Link>
            <span className="mx-2">›</span>
            <span>Timezone Converter</span>
          </nav>
        </header>

        {/* Tools Navigation */}
        <div className="mb-6">
          <ToolsNavigation currentTool="timezone" />
        </div>

        {/* Timezone Converter */}
        <TimezoneConverter className="mb-8" />


        {/* Timezone Resources */}
        <section className="bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-border/50 dark:border-slate-700/50 mb-8">
          <h2 className="text-lg font-bold text-foreground dark:text-slate-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            📚 Timezone Guides & Tips
          </h2>
          
          <p className="text-sm text-muted-foreground dark:text-slate-400 mb-4">
            Learn how to master timezone conversion for different scenarios and use cases.
          </p>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/articles/timezone-converter-remote-work-meetings"
              className="p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-all duration-200 group"
            >
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-100">
                Remote Work Meetings
              </h3>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                Schedule global meetings without confusion
              </p>
            </Link>
            
            <Link
              href="/articles/travel-timezone-converter"
              className="p-3 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg border border-cyan-200 dark:border-cyan-800 hover:shadow-md transition-all duration-200 group"
            >
              <h3 className="font-semibold text-cyan-800 dark:text-cyan-200 text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-100">
                Travel Planning
              </h3>
              <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">
                Plan international trips with timezone conversion
              </p>
            </Link>
            
            <Link
              href="/articles/timezone-converter-gaming-events"
              className="p-3 bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 rounded-lg border border-violet-200 dark:border-violet-800 hover:shadow-md transition-all duration-200 group"
            >
              <h3 className="font-semibold text-violet-800 dark:text-violet-200 text-sm group-hover:text-violet-600 dark:group-hover:text-violet-100">
                Gaming & Esports
              </h3>
              <p className="text-xs text-violet-700 dark:text-violet-300 mt-1">
                Never miss game releases or tournaments
              </p>
            </Link>
            
            <Link
              href="/articles/stock-market-timezone-converter"
              className="p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-200 group"
            >
              <h3 className="font-semibold text-green-800 dark:text-green-200 text-sm group-hover:text-green-600 dark:group-hover:text-green-100">
                Stock Market Hours
              </h3>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Track global market opens and closes
              </p>
            </Link>
            
            <Link
              href="/articles/timezone-converter-family-calls"
              className="p-3 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg border border-pink-200 dark:border-pink-800 hover:shadow-md transition-all duration-200 group"
            >
              <h3 className="font-semibold text-pink-800 dark:text-pink-200 text-sm group-hover:text-pink-600 dark:group-hover:text-pink-100">
                Family & Friends
              </h3>
              <p className="text-xs text-pink-700 dark:text-pink-300 mt-1">
                Perfect timing for international calls
              </p>
            </Link>
            
            <Link
              href="/"
              className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-all duration-200 group"
            >
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-100">
                Time Calculator
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                Calculate duration between two times
              </p>
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-border/50 dark:border-slate-700/50 mb-8">
          <h2 className="text-lg font-bold text-foreground dark:text-slate-100 mb-6">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer font-medium text-foreground dark:text-slate-200 mb-2 flex items-center gap-2 hover:text-primary dark:hover:text-accent transition-colors">
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-90 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Does this handle Daylight Saving Time?
              </summary>
              <div className="text-sm text-muted-foreground dark:text-slate-400 ml-6">
                Yes! Our timezone converter automatically handles Daylight Saving Time (DST) transitions for all supported timezones. The conversion accounts for whether DST is active on the specific date you're converting.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium text-foreground dark:text-slate-200 mb-2 flex items-center gap-2 hover:text-primary dark:hover:text-accent transition-colors">
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-90 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                How do I convert between 12h and 24h time?
              </summary>
              <div className="text-sm text-muted-foreground dark:text-slate-400 ml-6">
                Use the "12h/24h format" toggle button at the top right of the converter. Your preference is automatically saved and will be remembered for future visits.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium text-foreground dark:text-slate-200 mb-2 flex items-center gap-2 hover:text-primary dark:hover:text-accent transition-colors">
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-90 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Can I convert historical or future dates?
              </summary>
              <div className="text-sm text-muted-foreground dark:text-slate-400 ml-6">
                Absolutely! Use the date and time inputs to specify any date in the past or future. The converter will account for DST rules that were or will be in effect on that specific date.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium text-foreground dark:text-slate-200 mb-2 flex items-center gap-2 hover:text-primary dark:hover:text-accent transition-colors">
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-90 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                What timezone database does this use?
              </summary>
              <div className="text-sm text-muted-foreground dark:text-slate-400 ml-6">
                We use the IANA Time Zone Database (also known as the Olson database), which is the global standard for timezone information. This ensures accurate and up-to-date timezone conversions worldwide.
              </div>
            </details>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
