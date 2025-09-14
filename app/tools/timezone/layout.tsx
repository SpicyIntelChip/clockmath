import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timezone Converter | ClockMath',
  description: 'Convert time between any two timezones instantly. Handles Daylight Saving Time automatically. Perfect for scheduling meetings, calls, or events across different time zones.',
  alternates: {
    canonical: 'https://clockmath.com/tools/timezone',
  },
  openGraph: {
    title: 'Timezone Converter | ClockMath',
    description: 'Convert time between any two timezones instantly. Handles DST automatically.',
    type: 'website',
    url: 'https://clockmath.com/tools/timezone',
    siteName: 'ClockMath',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'ClockMath Timezone Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TimezoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
