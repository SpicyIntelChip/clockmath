import Link from "next/link";
import RelatedArticles from "./RelatedArticles";
import ArticleAnalytics from "./ArticleAnalytics";
import ArticleCtaLink from "./ArticleCtaLink";
import JsonLd, { getArticleSchema } from "./JsonLd";

interface ArticleLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  publishDate?: string;
  category?: 'timezone' | 'calculator' | 'productivity' | 'business';
  currentPath?: string;
}

export default function ArticleLayout({ 
  children, 
  title, 
  description, 
  publishDate = "2025",
  category = "calculator",
  currentPath = ""
}: ArticleLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/20">
      <JsonLd
        data={getArticleSchema({
          headline: title,
          description,
          url: `https://clockmath.com${currentPath}`,
          datePublished: `${publishDate}-01-01`,
        })}
      />
      <ArticleAnalytics title={title} category={category} currentPath={currentPath} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(5,150,105,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(5,150,105,0.2),transparent_50%)]"></div>
      
      <main className="relative max-w-4xl mx-auto px-4 py-8">
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
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-2 rounded-xl shadow-lg border border-slate-700 dark:border-slate-600">
                  <svg width="40" height="40" viewBox="0 0 80 80" className="w-8 h-8">
                    <circle cx="40" cy="40" r="39.5" fill="white" stroke="#1e293b" strokeWidth="1"></circle>
                    <text x="40" y="15" textAnchor="middle" className="text-xs font-bold fill-emerald-600">+</text>
                    <text x="65" y="45" textAnchor="middle" className="text-xs font-bold fill-emerald-600">×</text>
                    <text x="40" y="70" textAnchor="middle" className="text-xs font-bold fill-red-500">÷</text>
                    <text x="15" y="45" textAnchor="middle" className="text-xs font-bold fill-red-500">−</text>
                    <line x1="40" y1="40" x2="40" y2="25" stroke="#059669" strokeWidth="2" strokeLinecap="round"></line>
                    <line x1="40" y1="40" x2="52" y2="40" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"></line>
                    <circle cx="40" cy="40" r="1.5" fill="#1e293b"></circle>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">Clock</span>{" "}
                  <span className="text-blue-600 dark:text-blue-400">Math</span>
                </h1>
                <p className="text-sm text-muted-foreground">Resources</p>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-border/50 dark:border-slate-700/50">
          <header className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground dark:text-slate-100 mb-4">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground dark:text-slate-400 mb-4">
              {description}
            </p>
            <time className="text-sm text-muted-foreground">
              Published {publishDate}
            </time>
          </header>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            {children}
          </div>

          {/* Call to Action */}
          <div className="mt-12 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="text-center">
              <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                Try Our Free Time Calculator
              </h3>
              <p className="text-emerald-700 dark:text-emerald-300 mb-4">
                Calculate time duration instantly with our easy-to-use tool
              </p>
              <ArticleCtaLink href="/" title={title} />
            </div>
          </div>
        </article>

        {/* Smart Related Articles Component */}
        <div className="mt-8">
          <RelatedArticles
            currentPath={currentPath}
            category={category}
            maxArticles={3}
          />
        </div>
      </main>
    </div>
  );
}
