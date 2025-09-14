/**
 * components/SiteFooter.tsx
 * Minimal footer with email + BMC link. Server Component; no 'use client' needed.
 * Tailwind classes are optional—remove if you're not using Tailwind.
 */
export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 sm:mt-12">
      <div className="bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-border/50 dark:border-slate-700/50 text-center">
        <p className="text-sm text-muted-foreground dark:text-slate-400 mb-4">
          Find Clock Math useful? Support the development!
        </p>

        {/* Buy Me a Coffee button */}
        <a
          href="https://www.buymeacoffee.com/clockmath?utm_source=clockmath&utm_medium=site&utm_campaign=footer_button"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mb-4"
          aria-label="Support Clock Math on Buy Me a Coffee"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M2 19h18v2H2v-2zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM20 8h-2V5h2v3zM4 5h12v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V5z" />
            <path d="M7 3.5c0-.3.2-.5.5-.5s.5.2.5.5c0 .8-.2 1.2-.5 1.5-.3-.3-.5-.7-.5-1.5z" opacity="0.8" />
            <path d="M10 2.8c0-.4.2-.8.5-.8s.5.4.5.8c0 1-.3 1.5-.5 1.8-.2-.3-.3-.5-.3-1.8 0-.4.1-.7.1-.7z" opacity="0.9" />
            <path d="M13 3.2c0-.3.2-.7.5-.7s.5.4.5.7c0 .9-.2 1.3-.5 1.6-.3-.3-.5-.7-.5-1.6z" opacity="0.7" />
            <path d="M8 1.8c.3 0 .5.3.5.7 0 .6-.1.9-.3 1.1-.2-.2-.3-.5-.3-1.1 0-.4.1-.7.1-.7z" opacity="0.6" />
            <path d="M11.5 1.5c.2 0 .4.2.4.6 0 .7-.2 1-.4 1.2-.2-.2-.4-.5-.4-1.2 0-.4.2-.6.4-.6z" opacity="0.8" />
          </svg>
          Buy Me a Coffee
        </a>

        {/* Contact + site links */}
        <div className="text-xs sm:text-sm text-muted-foreground dark:text-slate-400 mb-2">
          <a
            href="mailto:hello@clockmath.com?subject=Clock%20Math%20feedback"
            className="underline underline-offset-4 hover:text-foreground"
          >
            hello@clockmath.com
          </a>
          <span className="mx-2">·</span>
          <a href="https://clockmath.com" className="hover:text-foreground">clockmath.com</a>
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground dark:text-slate-400 mb-2">
          <a
            href="/terms"
            className="hover:text-foreground underline underline-offset-4"
          >
            Terms of Service
          </a>
          <a
            href="/privacy"
            className="hover:text-foreground underline underline-offset-4"
          >
            Privacy Policy
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-muted-foreground dark:text-slate-500 opacity-75">
          © {year} Clock Math
        </div>
      </div>
    </footer>
  );
}
