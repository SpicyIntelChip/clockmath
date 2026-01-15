'use client';

/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect, useCallback } from 'react';
import { TimezoneConverter } from '@/components/TimezoneConverter';
import SiteFooter from '@/components/SiteFooter';
import PageChrome from '@/components/PageChrome';
import Link from 'next/link';
import { Toaster } from '@/components/ui/toaster';
import JsonLd, { getSoftwareApplicationSchema } from '@/components/JsonLd';

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
    <PageChrome currentTool="timezone" onToggleTheme={toggleDarkMode} isDarkMode={isDarkMode}>
      <JsonLd
        data={getSoftwareApplicationSchema({
          name: 'ClockMath Timezone Converter',
          description: 'Convert time between any timezone instantly. Auto-detects your location, supports all global timezones, and handles daylight saving time.',
          url: 'https://clockmath.com/tools/timezone/',
        })}
      />
      <Toaster />

        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
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
        {/* Timezone Converter */}
        <TimezoneConverter className="mb-8" />


        <SiteFooter />
    </PageChrome>
  );
}
