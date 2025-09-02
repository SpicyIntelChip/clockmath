// lib/gtag.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5L3QN6938D";

type GtagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  params?: Record<string, any>;
};

export const pageview = (url: string) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  (window as any).gtag?.("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const event = ({ action, params = {} }: GtagEvent) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  (window as any).gtag?.("event", action, params);
};
