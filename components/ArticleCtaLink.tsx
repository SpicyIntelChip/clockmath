'use client';

import Link from 'next/link';
import { event as gaEvent } from '@/lib/gtag';

interface ArticleCtaLinkProps {
  href: string;
  title: string;
}

export default function ArticleCtaLink({ href, title }: ArticleCtaLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium rounded-xl hover:from-emerald-500 hover:to-emerald-400 transition-all duration-200 shadow-lg hover:shadow-xl"
      onClick={() =>
        gaEvent({
          action: 'article_primary_cta_click',
          params: {
            from: title,
            target: href,
          },
        })
      }
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Start Calculating
    </Link>
  );
}
