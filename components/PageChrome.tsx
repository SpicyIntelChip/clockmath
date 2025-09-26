import ToolsNavigation from '@/components/ToolsNavigation';

interface PageChromeProps {
  children: React.ReactNode;
  currentTool: 'calculator' | 'timezone' | 'articles';
  className?: string;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
}

export default function PageChrome({ currentTool, children, className = '', onToggleTheme, isDarkMode }: PageChromeProps) {
  return (
    <div className={`relative min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/20 ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(5,150,105,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(5,150,105,0.18),transparent_55%)]" />
      <main className="relative max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <ToolsNavigation currentTool={currentTool} />
            </div>
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm text-foreground dark:text-slate-200 rounded-xl hover:bg-card dark:hover:bg-slate-700 transition-all duration-200 shadow-lg border border-border/50 dark:border-slate-700/50 ml-4"
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
                    <span className="hidden sm:inline">Light Mode</span>
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
                    <span className="hidden sm:inline">Dark Mode</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
