// lib/gtag.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5L3QN6938D";

type GtagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  params?: Record<string, any>;
};

// Check if analytics should be blocked
const isAnalyticsBlocked = () => {
  if (typeof window === "undefined") return true;
  
  return process.env.NODE_ENV === 'development' || 
         process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === 'true' ||
         window.location.hostname === 'localhost' ||
         !GA_MEASUREMENT_ID;
};

export const pageview = (url: string) => {
  if (isAnalyticsBlocked()) {
    console.log('🛡️ Pageview blocked:', url);
    return;
  }
  (window as any).gtag?.("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const event = ({ action, params = {} }: GtagEvent) => {
  if (isAnalyticsBlocked()) {
    console.log('🛡️ Event blocked:', action, params);
    return;
  }
  (window as any).gtag?.("event", action, params);
};
