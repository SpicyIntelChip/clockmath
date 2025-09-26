import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

// Define the base URL for the site
const baseUrl = 'https://clockmath.com';

/**
 * Recursively find all page.tsx files in the app directory
 * to automatically generate sitemap entries
 */
function getAllPages(dir: string, basePath: string = ''): string[] {
  const pages: string[] = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const urlPath = path.posix.join(basePath, item.name);
      
      if (item.isDirectory()) {
        // Recursively search subdirectories
        pages.push(...getAllPages(fullPath, urlPath));
      } else if (item.isFile() && item.name === 'page.tsx') {
        // Found a page, add its path to the list
        const routePath = formatRoutePath(basePath);
        pages.push(routePath);
      }
    }
  } catch (error) {
    console.warn(`Could not read directory ${dir}:`, error);
  }
  
  return pages;
}

function formatRoutePath(basePath: string): string {
  if (!basePath) {
    return '/';
  }

  const normalized = basePath
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '');

  return `/${normalized}`;
}

/**
 * Get article metadata for better lastmod dates
 */
function getArticleMetadata(articlePath: string) {
  try {
    const filePath = path.join(process.cwd(), 'app', articlePath, 'page.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract publish date if available (rough regex match)
    const publishDateMatch = content.match(/publishDate['":\s]*['"]([^'"]+)['"]/);
    const publishDate = publishDateMatch ? publishDateMatch[1] : null;
    
    return {
      lastmod: publishDate || '2025-01-15',
    };
  } catch {
    return {
      lastmod: '2025-01-15',
    };
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const appDir = path.join(process.cwd(), 'app');
  const pages = Array.from(new Set(getAllPages(appDir)));
  
  // Define custom priorities and change frequencies for different page types
  const sitemapEntries: MetadataRoute.Sitemap = pages.map((page) => {
    let priority = 0.5;
    let changeFreq: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
    let lastmod = '2025-01-15';
    
    // Determine priority and change frequency based on page type
    if (page === '/') {
      priority = 1.0;
      changeFreq = 'weekly';
      lastmod = new Date().toISOString().split('T')[0];
    } else if (page.startsWith('/tools/')) {
      priority = 0.9;
      changeFreq = 'monthly';
    } else if (page === '/articles') {
      priority = 0.85;
      changeFreq = 'weekly';
    } else if (page.startsWith('/articles/')) {
      priority = 0.8;
      changeFreq = 'monthly';
      // Get specific article metadata
      const articleMetadata = getArticleMetadata(page.substring(1)); // Remove leading slash
      lastmod = articleMetadata.lastmod;
    } else if (page === '/contact') {
      priority = 0.7;
      changeFreq = 'monthly';
    } else if (page === '/privacy' || page === '/terms') {
      priority = 0.3;
      changeFreq = 'yearly';
    }
    
    return {
      url: `${baseUrl}${page === '/' ? '/' : `${page.replace(/\/+$/, '')}/`}`,
      lastModified: lastmod,
      changeFrequency: changeFreq,
      priority: priority,
    };
  });
  
  // Add any additional static pages that might not be auto-discovered
  const additionalPages = [
    // Add any API routes or special pages here if needed
  ];
  
  return [...sitemapEntries, ...additionalPages];
}

// Export the sitemap function as the default export
export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate once per day
