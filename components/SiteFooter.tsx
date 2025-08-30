/**
 * components/SiteFooter.tsx
 * Minimal footer with email + BMC link. Server Component; no 'use client' needed.
 * Tailwind classes are optional—remove if you're not using Tailwind.
 */
export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 border-t border-slate-200 pt-4 text-sm text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <span>© {year} Clock Math</span>
      <p>
        <a
          href="mailto:hello@clockmath.com?subject=Clock%20Math%20feedback"
          className="underline underline-offset-4 hover:text-slate-700"
        >
          hello@clockmath.com
        </a>
        <span className="mx-2">·</span>
        <a
          href="https://www.buymeacoffee.com/clockmath"
          target="_blank" rel="noopener noreferrer"
          className="hover:text-slate-700"
        >
          ☕ Buy me a coffee
        </a>
      </p>
    </footer>
  );
}
