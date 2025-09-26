import Head from 'next/head';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishDate?: string;
  noindex?: boolean;
  keywords?: string;
}

/**
 * Reusable SEO component that ensures consistent meta tags and canonical URLs
 * across all pages. Enforces non-www canonical URLs.
 */
export default function SEOHead({
  title,
  description,
  canonicalUrl,
  ogImage = '/og.png',
  ogType = 'website',
  publishDate,
  noindex = false,
  keywords,
}: SEOHeadProps) {
  // Ensure canonical URL is non-www and has trailing slash
  const cleanCanonicalUrl = (() => {
    const trimmed = canonicalUrl.trim();
    const normalizedInput = (() => {
      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
      }
      if (trimmed.startsWith('//')) {
        return `https:${trimmed}`;
      }
      if (trimmed.startsWith('/')) {
        return `https://clockmath.com${trimmed}`;
      }
      return `https://${trimmed}`;
    })();

    try {
      const url = new URL(normalizedInput);
      url.protocol = 'https:';
      url.hostname = 'clockmath.com';
      url.hash = '';

      const normalizedPath = url.pathname.replace(/\/+$/, '');
      url.pathname = normalizedPath === '' ? '/' : `${normalizedPath}/`;

      return url.toString();
    } catch {
      const normalizedPath = (trimmed.startsWith('/') ? trimmed : `/${trimmed}`)
        .replace(/\/+$/, '');
      const fallbackPath = normalizedPath || '/';
      const finalPath = fallbackPath.endsWith('/') ? fallbackPath : `${fallbackPath}/`;
      return `https://clockmath.com${finalPath}`;
    }
  })();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': ogType === 'article' ? 'Article' : 'WebPage',
    headline: title,
    description: description,
    url: cleanCanonicalUrl,
    ...(ogType === 'article' && publishDate && {
      datePublished: publishDate,
      dateModified: publishDate,
      author: {
        '@type': 'Organization',
        name: 'ClockMath',
        url: 'https://clockmath.com/',
      },
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': cleanCanonicalUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ClockMath',
      url: 'https://clockmath.com/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://clockmath.com/logo.svg',
      },
    },
    image: {
      '@type': 'ImageObject',
      url: `https://clockmath.com${ogImage}`,
      width: 1200,
      height: 630,
    },
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL - Always non-www with trailing slash */}
      <link rel="canonical" href={cleanCanonicalUrl} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={cleanCanonicalUrl} />
      <meta property="og:site_name" content="ClockMath" />
      <meta property="og:image" content={`https://clockmath.com${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`ClockMath - ${title}`} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://clockmath.com${ogImage}`} />
      
      {/* Additional SEO Tags */}
      <meta name="generator" content="Next.js" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      {/* Prevent indexing of www version */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (window.location.hostname.startsWith('www.')) {
              window.location.replace('https://clockmath.com' + window.location.pathname + window.location.search);
            }
          `,
        }}
      />
    </Head>
  );
}
