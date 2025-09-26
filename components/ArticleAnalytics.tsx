'use client';

import { useEffect } from 'react';
import { event as gaEvent } from '@/lib/gtag';

interface ArticleAnalyticsProps {
  title: string;
  category: string;
  currentPath: string;
}

export default function ArticleAnalytics({ title, category, currentPath }: ArticleAnalyticsProps) {
  useEffect(() => {
    if (!currentPath) return;

    gaEvent({
      action: 'article_view',
      params: {
        title,
        category,
        path: currentPath,
      },
    });
  }, [title, category, currentPath]);

  return null;
}
