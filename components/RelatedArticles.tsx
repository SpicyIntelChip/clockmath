"use client";

import Link from 'next/link';
import { event as gaEvent } from '@/lib/gtag';
import {
  ARTICLE_LINKS,
  TOOL_LINKS,
  type ArticleLink,
  type ToolLink,
  type ArticleCategory,
} from '@/lib/articlesCatalog';

interface RelatedArticlesProps {
  currentPath: string;
  category?: ArticleCategory;
  maxArticles?: number;
  showAllCategories?: boolean;
}

/**
 * Intelligent related articles component that creates semantic content clusters
 * for improved internal linking and SEO
 */
export default function RelatedArticles({
  currentPath,
  category,
  maxArticles = 3,
  showAllCategories = false,
}: RelatedArticlesProps) {
  // Get related articles based on category and current page
  const getRelatedArticles = (): ArticleLink[] => {
    // Filter out current article when the page path is known
    let related = [...ARTICLE_LINKS];

    if (currentPath) {
      related = related.filter(article => article.href !== currentPath);
    }
    
    if (!showAllCategories && category) {
      // Prioritize same category
      const sameCategory = related.filter(article => article.category === category);
      const otherCategories = related.filter(article => article.category !== category);
      
      // Mix same category (80%) with other categories (20%) for diversity
      const sameCategoryCount = Math.min(Math.ceil(maxArticles * 0.8), sameCategory.length);
      const otherCategoryCount = maxArticles - sameCategoryCount;
      
      related = [
        ...sameCategory.slice(0, sameCategoryCount),
        ...otherCategories.slice(0, otherCategoryCount),
      ];
    }
    
    // Sort by priority and take requested number
    return related
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, maxArticles);
  };

  // Get cross-links to tools
  const getRelatedTools = (): ToolLink[] => {
    if (category === 'timezone') {
      const tool = TOOL_LINKS.find(link => link.href === '/tools/timezone');
      return tool ? [tool] : TOOL_LINKS.slice(0, 1);
    } else if (category === 'calculator') {
      const tool = TOOL_LINKS.find(link => link.href === '/');
      return tool ? [tool] : TOOL_LINKS.slice(0, 1);
    }
    return TOOL_LINKS.slice(0, 1);
  };

  const relatedArticles = getRelatedArticles();
  const relatedTools = getRelatedTools();

  if (relatedArticles.length === 0 && relatedTools.length === 0) {
    return null;
  }

  // Category colors for visual distinction
  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case 'timezone':
        return 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'calculator':
        return 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
      case 'productivity':
        return 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
      case 'business':
        return 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200';
      default:
        return 'from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <section className="bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/50 dark:border-slate-700/50">
      <h3 className="text-lg font-bold text-foreground dark:text-slate-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Related Articles
      </h3>
      
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">🔧 Helpful Tools</h4>
          <div className="space-y-2">
            {relatedTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`block p-3 bg-gradient-to-r ${getCategoryStyles(tool.category)} rounded-lg border hover:shadow-md transition-all duration-200 group`}
                onClick={() =>
                  gaEvent({
                    action: 'related_tool_click',
                    params: {
                      from: currentPath,
                      target: tool.href,
                      category,
                    },
                  })
                }
              >
                <h5 className="font-semibold text-sm group-hover:underline">
                  {tool.title}
                </h5>
                <p className="text-xs opacity-80 mt-1">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">📚 More Guides</h4>
          <div className="space-y-3">
            {relatedArticles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className={`block p-3 bg-gradient-to-r ${getCategoryStyles(article.category)} rounded-lg border hover:shadow-md transition-all duration-200 group`}
                onClick={() =>
                  gaEvent({
                    action: 'related_article_click',
                    params: {
                      from: currentPath,
                      target: article.href,
                      category,
                    },
                  })
                }
              >
                <h5 className="font-semibold text-sm group-hover:underline">
                  {article.title}
                </h5>
                <p className="text-xs opacity-80 mt-1">
                  {article.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Link to hub pages */}
      {category === 'timezone' && (
        <div className="mt-4 pt-4 border-t border-border/30 dark:border-slate-600/30">
          <Link
            href="/articles/timezone-converters"
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
          >
            View all timezone guides
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}
