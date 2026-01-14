/* eslint-disable react/no-unescaped-entities */
import { Metadata } from "next";
import Link from "next/link";
import ArticleLayout from "../../../components/ArticleLayout";

export const metadata: Metadata = {
  title: "Shift Work Hours Calculator – Track Overnight & Rotating Shifts",
  description: "Calculate shift work hours across midnight, rotating schedules, and irregular patterns. Free tool for nurses, factory workers, and night shift employees.",
  alternates: {
    canonical: "https://clockmath.com/articles/shift-work-hours-calculator",
  },
  openGraph: {
    title: "Shift Work Hours Calculator – Track Overnight & Rotating Shifts",
    description: "Calculate shift work hours across midnight, rotating schedules, and irregular patterns. Free tool for nurses, factory workers, and night shift employees.",
    type: "article",
    url: "https://clockmath.com/articles/shift-work-hours-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shift Work Hours Calculator – Track Overnight & Rotating Shifts",
    description: "Calculate shift work hours across midnight, rotating schedules, and irregular patterns. Free tool for nurses, factory workers, and night shift employees.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ShiftWorkHoursCalculatorPage() {
  return (
    <ArticleLayout
      title="How to Calculate Shift Work Hours"
      description="Shift workers face unique challenges when tracking hours—overnight shifts, rotating schedules, and irregular patterns make manual calculations error-prone."
      publishDate="2025"
      category="calculator"
      currentPath="/articles/shift-work-hours-calculator"
    >
      <h2>Introduction</h2>
      <p>
        Millions of workers operate outside the traditional 9-to-5 schedule. Nurses, factory workers, security guards, retail employees, and emergency responders often work shifts that cross midnight, rotate weekly, or follow irregular patterns. Calculating hours for these schedules manually is confusing and often leads to mistakes.
      </p>

      <h2>The Challenge of Overnight Shifts</h2>
      <p>
        When your shift starts at 11:00 PM and ends at 7:00 AM, simple subtraction doesn't work. You're crossing from one day into the next, which confuses traditional time tracking methods. Add rotating schedules into the mix—where you might work days one week and nights the next—and keeping accurate records becomes even more difficult.
      </p>

      <h2>The Solution</h2>
      <p>
        Our <Link href="/" className="text-emerald-600 hover:text-emerald-500 font-medium">time duration calculator</Link> handles overnight shifts automatically. Simply enter your start and end times, and the calculator correctly determines the hours worked—even when your shift crosses midnight. No mental math required.
      </p>

      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl my-6">
        <h3 className="font-bold text-lg mb-3">Night Shift Example</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Start:</strong> 11:00 PM</div>
          <div><strong>End:</strong> 7:30 AM (next day)</div>
          <div><strong>Break:</strong> 30 minutes</div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <strong>➡ Total Hours = 8 hours</strong>
          </div>
        </div>
      </div>

      <h2>Common Shift Work Patterns</h2>
      <p>
        Different industries use different shift structures. Here are some common patterns our calculator handles easily:
      </p>
      <ul>
        <li><strong>12-hour shifts:</strong> Common in healthcare and manufacturing (e.g., 7 AM – 7 PM or 7 PM – 7 AM)</li>
        <li><strong>8-hour rotating shifts:</strong> Day, swing, and night shifts that rotate weekly or bi-weekly</li>
        <li><strong>Split shifts:</strong> Working morning and evening with a long break in between</li>
        <li><strong>On-call shifts:</strong> Variable hours based on demand</li>
      </ul>

      <h2>Why Accurate Tracking Matters</h2>
      <p>
        Shift workers often qualify for differential pay—extra compensation for working nights, weekends, or holidays. Accurate time tracking ensures you're paid correctly for every hour worked. It also helps employers maintain compliance with labor laws regarding rest periods and maximum work hours.
      </p>

      <h2>Features for Shift Workers</h2>
      <ul>
        <li><strong>Automatic midnight handling:</strong> Correctly calculates hours when shifts cross into the next day</li>
        <li><strong>Break deduction:</strong> Subtract meal and rest breaks from your total</li>
        <li><strong>Decimal output:</strong> Get hours in decimal format for easy payroll entry</li>
        <li><strong>24-hour format:</strong> Switch between 12-hour and 24-hour time display</li>
      </ul>

      <h2>Conclusion</h2>
      <p>
        Whether you're working the night shift at a hospital, rotating through factory shifts, or covering weekend security duty, accurate hour tracking shouldn't be complicated. Use ClockMath's <Link href="/" className="text-emerald-600 hover:text-emerald-500 font-medium">shift hours calculator</Link> to quickly and accurately track your work time, no matter when your shift starts or ends.
      </p>
    </ArticleLayout>
  );
}
