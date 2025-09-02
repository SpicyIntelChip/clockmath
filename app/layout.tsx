import type React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Metadata } from "next";
import Analytics from "@/components/Analytics";

  

export const metadata: Metadata = {
  metadataBase: new URL("https://clockmath.com"),
  title: "Time Duration Calculator & Hours Calculator — Clock Math",
  description:
    "Calculate the time difference between two times (even across midnight). Fast, simple, mobile-friendly. Also shows decimal hours and minutes.",
  generator: "v0.app",
  alternates: {
    canonical: "https://clockmath.com/",
  },
  openGraph: {
    title: "Clock Math — Time Between Two Times",
    description:
      "Quickly compute elapsed time between two times. Handles crossing midnight; shows HH:MM:SS, minutes, and decimal hours.",
    type: "website",
    url: "https://clockmath.com/",
    siteName: "Clock Math",
    images: [
      {
        url: "/og.png",            // becomes https://clockmath.com/og.png
        width: 1200,
        height: 630,
        alt: "Clock Math — Time Between Two Times",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}