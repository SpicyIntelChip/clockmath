/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
import Link from 'next/link';
import { generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Timezone Converter Guides - All Scenarios | ClockMath',
  description: 'Complete guide to timezone conversion for remote work, travel, gaming, family calls, and more. Master global time coordination with ClockMath.',
  path: '/articles/timezone-converters',
  type: 'website',
  keywords: 'timezone converter, time zone conversion, global time, remote work, international travel, family calls, gaming events, stock market hours',
});

interface TimezoneGuide {
  title: string;
  description: string;
  href: string;
  category: string;
  icon: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readTime: string;
  useCase: string;
}

const TIMEZONE_GUIDES: TimezoneGuide[] = [
  {
    title: 'Remote Work Meeting Timezone Converter',
    description: 'Schedule global meetings without confusion. Perfect for distributed teams and international collaborations.',
    href: '/articles/timezone-converter-remote-work-meetings',
    category: 'Business',
    icon: '💼',
    difficulty: 'Beginner',
    readTime: '3 min read',
    useCase: 'Scheduling meetings across different time zones',
  },
  {
    title: 'Timezone Converter for Family Calls',
    description: 'Stay connected with loved ones abroad. Find the perfect time to call without waking anyone up.',
    href: '/articles/timezone-converter-family-calls',
    category: 'Personal',
    icon: '👨‍👩‍👧‍👦',
    difficulty: 'Beginner',
    readTime: '4 min read',
    useCase: 'Calling family and friends internationally',
  },
  {
    title: 'Travel Timezone Converter',
    description: 'Plan international trips with confidence. Handle jet lag and coordinate travel schedules efficiently.',
    href: '/articles/travel-timezone-converter',
    category: 'Travel',
    icon: '✈️',
    difficulty: 'Intermediate',
    readTime: '5 min read',
    useCase: 'International travel planning and jet lag management',
  },
  {
    title: 'Gaming Events Timezone Converter',
    description: 'Never miss game releases, esports tournaments, or online gaming events again.',
    href: '/articles/timezone-converter-gaming-events',
    category: 'Gaming',
    icon: '🎮',
    difficulty: 'Beginner',
    readTime: '3 min read',
    useCase: 'Game launches and esports event timing',
  },
  {
    title: 'Stock Market Timezone Converter',
    description: 'Track global market opens and closes. Master trading across NYSE, LSE, Tokyo, and more.',
    href: '/articles/stock-market-timezone-converter',
    category: 'Finance',
    icon: '📈',
    difficulty: 'Advanced',
    readTime: '6 min read',
    useCase: 'Global stock market trading and analysis',
  },
];

const CATEGORY_COLORS = {
  Business: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
  Personal: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800',
  Travel: 'from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800',
  Gaming: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
  Finance: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
};

export default function TimezoneConvertersHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(5,150,105,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(5,150,105,0.2),transparent_50%)]"></div>
      
      <main className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header with back link */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Calculator
          </Link>
          
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              ClockMath
            </Link>
            <span className="mx-2">›</span>
            <span className="text-muted-foreground">
              Articles
            </span>
            <span className="mx-2">›</span>
            <span>Timezone Converters</span>
          </nav>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-3 rounded-xl shadow-lg border border-slate-700 dark:border-slate-600">
                  <svg width="48" height="48" viewBox="0 0 80 80" className="w-10 h-10">
                    {/* Globe with timezone indicators */}
                    <circle cx="40" cy="40" r="39.5" fill="white" stroke="#1e293b" strokeWidth="1"></circle>
                    <ellipse cx="40" cy="40" rx="20" ry="39" fill="none" stroke="#059669" strokeWidth="2" />
                    <ellipse cx="40" cy="40" rx="10" ry="39" fill="none" stroke="#059669" strokeWidth="1.5" />
                    <ellipse cx="40" cy="40" rx="30" ry="39" fill="none" stroke="#059669" strokeWidth="1.5" />
                    <ellipse cx="40" cy="40" rx="39" ry="20" fill="none" stroke="#059669" strokeWidth="2" />
                    <ellipse cx="40" cy="40" rx="39" ry="10" fill="none" stroke="#059669" strokeWidth="1.5" />
                    <line x1="40" y1="40" x2="40" y2="25" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
                    <line x1="40" y1="40" x2="52" y2="40" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="40" cy="40" r="2" fill="#1e293b" />
                    <text x="58" y="28" textAnchor="middle" className="text-xs font-bold fill-amber-500">🌍</text>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">Timezone</span>{" "}
                  <span className="text-blue-600 dark:text-blue-400">Converter</span>{" "}
                  <span className="text-slate-700 dark:text-slate-300">Guides</span>
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Master time coordination for every scenario
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-border/50 dark:border-slate-700/50">
          <h2 className="text-2xl font-bold text-foreground dark:text-slate-100 mb-4">
            Complete Timezone Conversion Guide
          </h2>
          <p className="text-lg text-muted-foreground dark:text-slate-400 mb-4">
            Whether you're scheduling international meetings, calling family abroad, or tracking global events, 
            proper timezone conversion is essential. Our comprehensive guides cover every scenario you'll encounter.
          </p>
          
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h3 className="font-semibold text-primary">Try Our Timezone Converter Tool</h3>
            </div>
            <p className="text-sm text-muted-foreground dark:text-slate-400 mb-3">
              Convert any time between timezones instantly with our free tool.
            </p>
            <Link
              href="/tools/timezone"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Use Timezone Converter
            </Link>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {TIMEZONE_GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className={`group block p-6 bg-gradient-to-br ${CATEGORY_COLORS[guide.category as keyof typeof CATEGORY_COLORS]} rounded-2xl border hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">{guide.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-1 bg-white/50 dark:bg-black/20 rounded-full font-medium">
                      {guide.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {guide.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg group-hover:underline line-clamp-2">
                    {guide.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-sm opacity-80 mb-3 line-clamp-3">
                {guide.description}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-70">
                  Perfect for: {guide.useCase}
                </span>
                <span className={`px-2 py-1 rounded-full font-medium ${
                  guide.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  guide.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {guide.difficulty}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Tips Section */}
        <div className="bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/50 dark:border-slate-700/50 mb-8">
          <h3 className="text-xl font-bold text-foreground dark:text-slate-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Essential Timezone Tips
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-muted/30 dark:bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground dark:text-slate-200 mb-2 flex items-center gap-2">
                <span className="text-blue-500">💡</span>
                Always Include Timezone
              </h4>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                When scheduling, always specify the timezone (e.g., "3 PM EST" not just "3 PM").
              </p>
            </div>
            
            <div className="bg-muted/30 dark:bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground dark:text-slate-200 mb-2 flex items-center gap-2">
                <span className="text-green-500">⏰</span>
                Account for DST
              </h4>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Daylight Saving Time changes can shift meeting times by an hour.
              </p>
            </div>
            
            <div className="bg-muted/30 dark:bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground dark:text-slate-200 mb-2 flex items-center gap-2">
                <span className="text-purple-500">🌍</span>
                Use UTC as Reference
              </h4>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                For global teams, UTC provides a consistent reference point.
              </p>
            </div>
            
            <div className="bg-muted/30 dark:bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground dark:text-slate-200 mb-2 flex items-center gap-2">
                <span className="text-orange-500">📱</span>
                Double-Check Conversions
              </h4>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Always verify timezone conversions, especially for important events.
              </p>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/50 dark:border-slate-700/50">
          <h3 className="text-xl font-bold text-foreground dark:text-slate-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            🔧 Related Tools
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/tools/timezone"
              className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm group-hover:underline">
                🌍 Timezone Converter Tool
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                Convert time between any timezone instantly
              </p>
            </Link>
            
            <Link
              href="/"
              className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm group-hover:underline">
                ⏱️ Time Duration Calculator
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Calculate time between two times
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
