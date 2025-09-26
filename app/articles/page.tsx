'use client';

import { getArticlesByCategory } from '@/lib/articlesCatalog';
import ArticlesIndexContent from '@/components/ArticlesIndexContent';
import Head from 'next/head';

const CATEGORY_COPY: Record<string, { title: string; blurb: string }> = {
  timezone: {
    title: 'Timezone Playbooks',
    blurb: 'Solve scheduling challenges for remote work, travel, gaming, and global family calls.',
  },
  calculator: {
    title: 'Calculator Tutorials',
    blurb: 'Learn how to get the most accurate results from ClockMath tools and time math techniques.',
  },
  productivity: {
    title: 'Productivity Guides',
    blurb: 'Time blocking, focus frameworks, and routines to get more done without burnout.',
  },
  business: {
    title: 'Business Operations',
    blurb: 'Team coordination, shift planning, and payroll-ready tracking tips (coming soon).',
  },
};

function sortArticlesByPriority() {
  const grouped = getArticlesByCategory();

  (Object.keys(grouped) as Array<keyof typeof grouped>).forEach((category) => {
    grouped[category] = grouped[category]
      .slice()
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  });

  return grouped;
}

export default function ArticlesIndexPage() {
  const groupedArticles = sortArticlesByPriority();

  return (
    <>
      <Head>
        <title>Time Calculators & Timezone Guides | ClockMath Articles</title>
        <meta name="description" content="Browse every ClockMath guide: calculator tutorials, timezone playbooks, and productivity tips to master time across work and life." />
        <link rel="canonical" href="https://clockmath.com/articles/" />
      </Head>
      <ArticlesIndexContent 
        groupedArticles={groupedArticles} 
        categoryCopy={CATEGORY_COPY} 
      />
    </>
  );
}
