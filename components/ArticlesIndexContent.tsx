'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import PageChrome from '@/components/PageChrome';
import SiteFooter from '@/components/SiteFooter';
import type { ArticleCategory, ArticleLink } from '@/lib/articlesCatalog';
import { Search, Filter, Clock, Target, Users, Briefcase } from 'lucide-react';

type GroupedArticles = Record<ArticleCategory, ArticleLink[]>;

type CategoryCopy = Record<string, { title: string; blurb: string }>;

interface ArticlesIndexContentProps {
  groupedArticles: GroupedArticles;
  categoryCopy: CategoryCopy;
}

export default function ArticlesIndexContent({ groupedArticles, categoryCopy }: ArticlesIndexContentProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'title' | 'category'>('priority');

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

  // Flatten all articles for search and filtering
  const allArticles = useMemo(() => {
    return Object.values(groupedArticles).flat();
  }, [groupedArticles]);

  // Filter and search articles
  const filteredArticles = useMemo(() => {
    let articles = allArticles;

    // Filter by category
    if (selectedCategory !== 'all') {
      articles = articles.filter(article => article.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query)
      );
    }

    // Sort articles
    return articles.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return (b.priority ?? 0) - (a.priority ?? 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }, [allArticles, selectedCategory, searchQuery, sortBy]);

  // Get category stats
  const categoryStats = useMemo(() => {
    const stats: Record<ArticleCategory | 'all', number> = { all: allArticles.length };
    Object.entries(groupedArticles).forEach(([category, articles]) => {
      stats[category as ArticleCategory] = articles.length;
    });
    return stats;
  }, [allArticles, groupedArticles]);

  // Category icons
  const getCategoryIcon = (category: ArticleCategory) => {
    switch (category) {
      case 'timezone': return Clock;
      case 'calculator': return Target;
      case 'productivity': return Users;
      case 'business': return Briefcase;
      default: return Target;
    }
  };

  // Category colors
  const getCategoryColors = (category: ArticleCategory) => {
    switch (category) {
      case 'timezone':
        return 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200';
      case 'calculator':
        return 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
      case 'productivity':
        return 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
      case 'business':
        return 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'from-muted/50 to-muted/30 dark:from-slate-700/50 dark:to-slate-600/30 border-border/30 dark:border-slate-600/30 text-foreground dark:text-slate-200';
    }
  };

  return (
    <PageChrome currentTool="articles" onToggleTheme={toggleDarkMode} isDarkMode={isDarkMode}>
      {/* Header */}
      <header className="text-center mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-lg border border-slate-700 dark:border-slate-600">
              {/* Book/Guides icon */}
              <svg width="80" height="80" viewBox="0 0 80 80" className="w-12 sm:w-16 h-12 sm:h-16">
                {/* Book cover */}
                <rect x="20" y="15" width="40" height="50" rx="4" fill="white" stroke="#1e293b" strokeWidth="1" />
                
                {/* Book pages effect */}
                <rect x="22" y="13" width="36" height="50" rx="3" fill="#f8fafc" stroke="#64748b" strokeWidth="0.5" opacity="0.7" />
                <rect x="24" y="11" width="32" height="50" rx="2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.5" opacity="0.5" />
                
                {/* Text lines */}
                <path d="M28 25h24" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                <path d="M28 32h24" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                <path d="M28 39h18" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                
                {/* Clock symbol on book */}
                <circle cx="48" cy="48" r="8" fill="#0f172a" />
                <circle cx="48" cy="48" r="7" fill="white" stroke="#1e293b" strokeWidth="0.5" />
                <path d="M48 44v4l3 3" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="48" cy="48" r="1" fill="#1e293b" />
                
                {/* Mathematical operators as accent */}
                <text x="32" y="55" textAnchor="middle" className="text-xs font-bold fill-emerald-600">
                  +
                </text>
                <text x="40" y="55" textAnchor="middle" className="text-xs font-bold fill-red-500">
                  =
                </text>
              </svg>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">Clock</span>{" "}
              <span className="text-blue-600 dark:text-blue-400">Math</span>{" "}
              <span className="text-slate-700 dark:text-slate-300">Guides</span>
            </h1>
            <p className="text-slate-700 dark:text-emerald-200 text-base sm:text-lg font-medium">
              Master every time scenario
            </p>
          </div>
        </div>
      </header>

      {/* Search and Filter Controls */}
      <section className="bg-card/70 dark:bg-slate-800/70 rounded-2xl p-6 shadow-lg border border-border/50 dark:border-slate-700/50 mb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background dark:bg-slate-700 border border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ArticleCategory | 'all')}
                className="w-full pl-10 pr-4 py-3 bg-background dark:bg-slate-700 border border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 appearance-none"
              >
                <option value="all">All Categories ({categoryStats.all})</option>
                <option value="timezone">Timezone ({categoryStats.timezone})</option>
                <option value="calculator">Calculator ({categoryStats.calculator})</option>
                <option value="productivity">Productivity ({categoryStats.productivity})</option>
                <option value="business">Business ({categoryStats.business})</option>
              </select>
            </div>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'priority' | 'title' | 'category')}
              className="w-full px-4 py-3 bg-background dark:bg-slate-700 border border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            >
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredArticles.length} guide{filteredArticles.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </span>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800 mb-8">
        <div className="text-center">
          <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
            Can't find what you're looking for?
          </h2>
          <p className="text-emerald-700 dark:text-emerald-300 mb-4">
            Send us your question and we'll help you out personally
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Us
          </Link>
        </div>
      </section>

      {/* Articles Grid */}
      <section>
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-card/70 dark:bg-slate-800/70 rounded-2xl border border-border/50 dark:border-slate-700/50">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground dark:text-slate-100 mb-2">
              No guides found
            </h3>
            <p className="text-muted-foreground dark:text-slate-400 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Show all guides
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => {
              const CategoryIcon = getCategoryIcon(article.category);
              const categoryColors = getCategoryColors(article.category);
              
              return (
                <Link
                  key={article.href}
                  href={article.href}
                  className="group block h-full"
                >
                  <div className={`h-full p-6 rounded-xl bg-gradient-to-br ${categoryColors} border hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg">
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div className="text-xs px-2 py-1 bg-white/50 dark:bg-slate-800/50 rounded-full font-medium uppercase tracking-wide">
                          {article.category}
                        </div>
                      </div>
                      {article.priority && article.priority >= 5 && (
                        <div className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full font-medium">
                          Popular
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold mb-3 group-hover:text-opacity-80 transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-sm opacity-90 leading-relaxed">
                      {article.description}
                    </p>
                    
                    <div className="mt-4 flex items-center text-xs opacity-75">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      2-3 min read
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <SiteFooter />
    </PageChrome>
  );
}
