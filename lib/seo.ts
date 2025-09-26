import { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  publishDate?: string;
  keywords?: string;
  noindex?: boolean;
  ogImage?: string;
}

/**
 * Generate standardized metadata for Next.js 13+ App Router
 * Ensures consistent SEO implementation across all pages
 */
export function generateSEOMetadata({
  title,
  description,
  path,
  type = 'website',
  publishDate,
  keywords,
  noindex = false,
  ogImage = '/og.png',
}: SEOConfig): Metadata {
  // Ensure canonical URL is properly formatted (non-www, with trailing slash)
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `https://clockmath.com${cleanPath}${cleanPath.endsWith('/') ? '' : '/'}`;

  const baseMetadata: Metadata = {
    metadataBase: new URL('https://clockmath.com'),
    title,
    description,
    keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
    
    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },
    
    // Open Graph
    openGraph: {
      title,
      description,
      type,
      url: canonicalUrl,
      siteName: 'ClockMath',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `ClockMath - ${title}`,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    
    // Robots
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
      },
    },
    
    // Additional metadata
    generator: 'Next.js',
    applicationName: 'ClockMath',
    referrer: 'origin-when-cross-origin',
    authors: [{ name: 'ClockMath', url: 'https://clockmath.com' }],
    creator: 'ClockMath',
    publisher: 'ClockMath',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };

  // Add article-specific metadata
  if (type === 'article' && publishDate) {
    baseMetadata.openGraph = {
      ...baseMetadata.openGraph,
      type: 'article',
      publishedTime: publishDate,
      modifiedTime: publishDate,
      authors: ['ClockMath'],
      section: 'Time Calculation Guides',
    };
  }

  return baseMetadata;
}

/**
 * Generate structured data for articles
 */
export function generateArticleStructuredData({
  title,
  description,
  path,
  publishDate,
}: {
  title: string;
  description: string;
  path: string;
  publishDate?: string;
}) {
  const canonicalUrl = `https://clockmath.com${path}${path.endsWith('/') ? '' : '/'}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: canonicalUrl,
    datePublished: publishDate || '2025-01-15',
    dateModified: publishDate || '2025-01-15',
    author: {
      '@type': 'Organization',
      name: 'ClockMath',
      url: 'https://clockmath.com/',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ClockMath',
      url: 'https://clockmath.com/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://clockmath.com/logo.svg',
        width: 300,
        height: 300,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://clockmath.com/og.png',
      width: 1200,
      height: 630,
    },
    articleSection: 'Time Calculation Guides',
    about: {
      '@type': 'Thing',
      name: 'Time Calculation',
      description: 'Tools and guides for calculating time differences, timezone conversions, and duration calculations.',
    },
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
