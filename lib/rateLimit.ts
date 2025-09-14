/**
 * Simple in-memory rate limiter for API routes
 * Resets per server instance - acceptable for MVP
 */

const store = new Map<string, { count: number; reset: number }>();

export function rateLimit({ 
  key, 
  limit, 
  windowMs 
}: { 
  key: string; 
  limit: number; 
  windowMs: number; 
}): boolean {
  const now = Date.now();
  const bucket = store.get(key);
  
  // If no bucket exists or the window has expired, create/reset it
  if (!bucket || now > bucket.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  
  // If we've hit the limit, deny the request
  if (bucket.count >= limit) {
    return false;
  }
  
  // Increment the count and allow the request
  bucket.count += 1;
  return true;
}

// Clean up expired entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store.entries()) {
    if (now > bucket.reset) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
