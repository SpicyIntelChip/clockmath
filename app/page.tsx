"use client"

import { useState, useEffect, useCallback } from "react"
import SeoIntro from "@/components/SeoIntro"
import SiteFooter from "@/components/SiteFooter"
import ToolsNavigation from "@/components/ToolsNavigation"
import { event as gaEvent } from "@/lib/gtag"


interface CalculationHistory {
  id: string
  startTime: string
  endTime: string
  assumeNextDay: boolean
  result: string
  timestamp: Date
}

function getDevice(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia?.("(pointer: coarse)")?.matches ? "mobile" : "desktop";
}

function minutesBetween(start: Date, end: Date): { totalMin: number; overnight: boolean } {
  const s = start.getTime();
  let e = end.getTime();
  let overnight = false;
  if (e < s) {
    e += 24 * 60 * 60 * 1000; // crossed midnight
    overnight = true;
  }
  return { totalMin: Math.round((e - s) / 60000), overnight };
}

export default function ClockMathPage() {
  const [startTime, setStartTime] = useState("09:00:00")
  const [endTime, setEndTime] = useState("17:30:00")
  const [assumeNextDay, setAssumeNextDay] = useState(false)
  const [result, setResult] = useState("")
  const [history, setHistory] = useState<CalculationHistory[]>([])
  const [is24HourFormat, setIs24HourFormat] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [startTimeValid, setStartTimeValid] = useState(true)
  const [endTimeValid, setEndTimeValid] = useState(true)
  // Removed activeTab state since we no longer have tab switching
  const [calculatedResultHTML, setCalculatedResultHTML] = useState<string | null>(null);
  const [prominentElapsed, setProminentElapsed] = useState<string | null>(null);

  // Emit debounced inputs_change (no PII)
  const emitInputsChange = useCallback(() => {
    gaEvent({
      action: "inputs_change",
      params: {
        page: "calculator",
        has_start: Boolean(startTime),
        has_end: Boolean(endTime),
        has_break: false, // This calculator doesn't have breaks, but keeping for consistency
        device: getDevice(),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
  }, [startTime, endTime]);
  

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("clockmath-darkmode")
    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === "true")
    } else {
      // Check system preference
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const parseTimeToSeconds = useCallback((str: string): number => {
    if (!str) return Number.NaN
    const parts = str.split(":")
    if (parts.length < 2) return Number.NaN
    const h = Number.parseInt(parts[0], 10)
    const m = Number.parseInt(parts[1], 10)
    const s = parts[2] !== undefined ? Number.parseInt(parts[2], 10) : 0
    if ([h, m, s].some(Number.isNaN)) return Number.NaN
    return h * 3600 + m * 60 + s
  }, [])

  const formatTimeDisplay = useCallback(
    (timeStr: string): string => {
      if (!timeStr || !is24HourFormat) {
        if (!timeStr) return "—"
        // Convert to 12-hour format
        const [hours, minutes, seconds] = timeStr.split(":")
        const h = Number.parseInt(hours, 10)
        const ampm = h >= 12 ? "PM" : "AM"
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
        return `${displayHour}:${minutes}${seconds ? `:${seconds}` : ""} ${ampm}`
      }
      return timeStr
    },
    [is24HourFormat],
  )

  const convertTo24Hour = useCallback((input: string): string => {
    if (!input) return ""
    
    // Remove extra spaces and normalize
    const cleaned = input.trim().toUpperCase().replace(/\s+/g, ' ')
    
    // Match patterns like "1:30 PM", "1:30:45 AM", "13:30", "9 AM", etc.
    const patterns = [
      // 12-hour format with AM/PM - full format
      /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/,
      // 12-hour format with AM/PM - hour only
      /^(\d{1,2})\s*(AM|PM)$/,
      // 24-hour format (just pass through after validation)
      /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
    ]
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern)
      if (!match) continue
      
      let hours = Number.parseInt(match[1], 10)
      let minutes = 0
      let seconds = 0
      let period = ""
      
      // Check which pattern matched
      if (match[4]) {
        // Full format: 1:30:45 AM or 1:30 AM
        minutes = Number.parseInt(match[2], 10)
        seconds = match[3] ? Number.parseInt(match[3], 10) : 0
        period = match[4]
      } else if (match[2] && (match[2] === "AM" || match[2] === "PM")) {
        // Hour-only format: 9 AM
        period = match[2]
      } else if (match[2]) {
        // 24-hour format: 13:30 or 13:30:45
        minutes = Number.parseInt(match[2], 10)
        seconds = match[3] ? Number.parseInt(match[3], 10) : 0
      }
      
      // Validate ranges
      if (minutes > 59 || seconds > 59) continue
      
      if (period && (period === "AM" || period === "PM")) {
        // 12-hour format conversion
        if (hours < 1 || hours > 12) continue
        if (period === "PM" && hours !== 12) hours += 12
        if (period === "AM" && hours === 12) hours = 0
      } else {
        // 24-hour format validation
        if (hours > 23) continue
      }
      
      // Format as HH:MM:SS
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    
    return "" // Invalid format
  }, [])

  const validateTimeInput = useCallback(
    (timeStr: string): boolean => {
      if (!timeStr) return false
      
      // In 12-hour mode, validate the displayed format, then convert and validate
      if (!is24HourFormat) {
        const converted = convertTo24Hour(formatTimeDisplay(timeStr))
        return converted !== ""
      }
      
      // In 24-hour mode, use the existing validation
      const seconds = parseTimeToSeconds(timeStr)
      return Number.isFinite(seconds)
    },
    [parseTimeToSeconds, is24HourFormat, convertTo24Hour, formatTimeDisplay],
  )

  const formatHMS = useCallback((totalSeconds: number): string => {
    const sign = totalSeconds < 0 ? -1 : 1
    let s = Math.abs(Math.floor(totalSeconds))
    const h = Math.floor(s / 3600)
    s -= h * 3600
    const m = Math.floor(s / 60)
    s -= m * 60
    const pad = (n: number) => String(n).padStart(2, "0")
    return (sign < 0 ? "-" : "") + `${h}:${pad(m)}:${pad(s)}`
  }, [])

  const saveToHistory = useCallback((start: string, end: string, nextDay: boolean, resultHtml: string) => {
    const newCalculation: CalculationHistory = {
      id: Date.now().toString(),
      startTime: start,
      endTime: end,
      assumeNextDay: nextDay,
      result: resultHtml,
      timestamp: new Date(),
    }

    setHistory((prev) => {
      const updated = [newCalculation, ...prev.slice(0, 9)] // Keep only last 10
      localStorage.setItem("clockmath-history", JSON.stringify(updated))
      return updated
    })
  }, [])

  useEffect(() => {
    const savedHistory = localStorage.getItem("clockmath-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setHistory(parsed)
      } catch (e) {
        console.error("Failed to parse history:", e)
      }
    }

    const savedFormat = localStorage.getItem("clockmath-timeformat")
    if (savedFormat) {
      setIs24HourFormat(savedFormat === "24")
    }
  }, [])

  function computeResultObject() {
    // validate
    const startValid = validateTimeInput(startTime);
    const endValid   = validateTimeInput(endTime);
    setStartTimeValid(startValid);
    setEndTimeValid(endValid);
  
    const s = parseTimeToSeconds(startTime);
    const e = parseTimeToSeconds(endTime);
  
    if (!Number.isFinite(s) || !Number.isFinite(e)) {
      return {
        resultHTML:
          '<span class="text-muted-foreground">Enter valid times to see the difference.</span>',
        elapsed: null as string | null,
      };
    }
  
    let end = e;
    // Option A: explicit next-day always adds +24h.
    // Otherwise auto-handle only when end < start.
    if (assumeNextDay) {
      end += 24 * 3600;
    } else if (end < s) {
      end += 24 * 3600;
    }
  
    const diff         = end - s;
    const minutes      = Math.round(diff / 60);
    const decimalHours = diff / 3600;
    const seconds      = diff;
  
    const resultHTML = `
      <div>Start</div><div><code>${formatTimeDisplay(startTime) || "—"}</code></div>
      <div>End</div><div><code>${formatTimeDisplay(endTime) || "—"}</code></div>
      <div>Elapsed (HH:MM:SS)</div><div><strong>${formatHMS(diff)}</strong></div>
      <div>Total minutes</div><div>${minutes.toLocaleString()}</div>
      <div>Decimal hours</div><div>${decimalHours.toFixed(3)}</div>
      <div>Total seconds</div><div>${seconds.toLocaleString()}</div>
    `;
  
    return { resultHTML, elapsed: formatHMS(diff) };
  }
  const handleCalculate = useCallback(() => {
    setIsCalculating(true);

    const { resultHTML, elapsed } = computeResultObject();

    // Calculate GA4 metrics before setting state
    const s = parseTimeToSeconds(startTime);
    const e = parseTimeToSeconds(endTime);
    let gaMetrics = {
      minutes_total: 0,
      hours_total: 0,
      had_break: false,
      overnight: false,
    };

    if (Number.isFinite(s) && Number.isFinite(e)) {
      let end = e;
      if (assumeNextDay) {
        end += 24 * 3600;
      } else if (end < s) {
        end += 24 * 3600;
        gaMetrics.overnight = true;
      }
      const diff = end - s;
      gaMetrics.minutes_total = Math.round(diff / 60);
      gaMetrics.hours_total = Number((diff / 3600).toFixed(2));
      gaMetrics.overnight = gaMetrics.overnight || assumeNextDay;
    }

    setTimeout(() => {
      setResult(resultHTML);
      setCalculatedResultHTML(resultHTML); // keep if you use it elsewhere (history, etc.)
      setProminentElapsed(elapsed);        // drives the big card
      if (elapsed) {
        saveToHistory(startTime, endTime, assumeNextDay, resultHTML);
      }
      setIsCalculating(false);

      // GA4: calculate_submit with useful params (no PII)
      gaEvent({
        action: "calculate_submit",
        params: {
          page: "calculator",
          minutes_total: gaMetrics.minutes_total,
          hours_total: gaMetrics.hours_total,
          had_break: gaMetrics.had_break,
          overnight: gaMetrics.overnight,
          device: getDevice(),
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
    }, 200);

    // Update URL only on manual calculate
    const params = new URLSearchParams();
    params.set("start", startTime);
    params.set("end",   endTime);
    if (assumeNextDay) params.set("next", "1");
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [startTime, endTime, assumeNextDay, validateTimeInput, parseTimeToSeconds, formatHMS, formatTimeDisplay, saveToHistory]);

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem("clockmath-history")
  }, [])

  const toggleTimeFormat = useCallback(() => {
    const newFormat = !is24HourFormat
    setIs24HourFormat(newFormat)
    localStorage.setItem("clockmath-timeformat", newFormat ? "24" : "12")
  }, [is24HourFormat])

  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem("clockmath-darkmode", newDarkMode.toString())
  }, [isDarkMode])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        handleCalculate() 
      }
    },
    [handleCalculate],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard?.writeText(text)
      return true
    } catch {
      return false
    }
  }

  const handleCopyResult = async () => {
    const resultText = document.getElementById("result")?.textContent?.trim() || ""
    const success = await copyToClipboard(resultText)
    if (success) {
      const btn = document.getElementById("copy-btn")
      if (btn) {
        btn.textContent = "Copied!"
        setTimeout(() => {
          btn.textContent = "Copy result"
        }, 1200)
      }
      gaEvent({
        action: "copy_result",
        params: { page: "calculator", has_result: Boolean(resultText), device: getDevice() },
      });
    } else {
      alert("Copy failed")
      gaEvent({
        action: "copy_result",
        params: { page: "calculator", has_result: Boolean(resultText), device: getDevice(), error: "clipboard" },
      });
    }
  }

  const handleCopyLink = async () => {
    const params = new URLSearchParams()
    if (startTime) params.set("start", startTime)
    if (endTime) params.set("end", endTime)
    if (assumeNextDay) params.set("next", "1")
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`

    const success = await copyToClipboard(url)
    if (success) {
      const btn = document.getElementById("copy-link-btn")
      if (btn) {
        btn.textContent = "Link copied!"
        setTimeout(() => {
          btn.textContent = "Copy shareable link"
        }, 1200)
      }
    } else {
      alert("Copy failed")
    }
  }

  const handleShare = async () => {
    const s = parseTimeToSeconds(startTime)
    const e = parseTimeToSeconds(endTime)
    let shareText = "Clock Math — time calculator"

    if (Number.isFinite(s) && Number.isFinite(e)) {
      let end = e
      // Option A: explicit next-day always adds +24h.
      // Otherwise auto-handle only when end < start.
      if (assumeNextDay) {
        end += 24 * 3600
      } else if (end < s) {
        end += 24 * 3600
      }
      const diff = end - s
      shareText = `Clock Math result: ${formatHMS(diff)} (from ${startTime} to ${endTime}${end >= 24 * 3600 ? " next day" : ""}) — ${window.location.origin}`
    }

    const params = new URLSearchParams()
    if (startTime) params.set("start", startTime)
    if (endTime) params.set("end", endTime)
    if (assumeNextDay) params.set("next", "1")
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`

    const shareData = {
      title: "Clock Math",
      text: shareText,
      url: shareUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        gaEvent({ action: "share_click", params: { page: "calculator", method: "web_share" } });
      } catch {
        // Share cancelled or failed
        gaEvent({ action: "share_click", params: { page: "calculator", method: "web_share_cancel" } });
      }
    } else {
      const success = await copyToClipboard(shareUrl)
      if (success) {
        const btn = document.getElementById("share-btn")
        if (btn) {
          btn.textContent = "Link copied!"
          setTimeout(() => {
            btn.textContent = "Share"
          }, 1200)
        }
      }
      gaEvent({ action: "share_click", params: { page: "calculator", method: "fallback" } });
    }
  }

  const handleClear = () => {
    setStartTime("")
    setEndTime("")
    setAssumeNextDay(false)
    window.history.replaceState(null, "", window.location.pathname)
  }

  // Load URL params on mount
  useEffect(() => {
    const url = new URL(window.location.href)
    const params = url.searchParams
    if (params.get("start")) setStartTime(params.get("start") || "")
    if (params.get("end")) setEndTime(params.get("end") || "")
    setAssumeNextDay(params.get("next") === "1")
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(5,150,105,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(5,150,105,0.2),transparent_50%)]" />

      
      
      <main className="relative max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <SeoIntro /> 
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",                // more specific than SoftwareApplication
      name: "Clock Math",
      url: "https://clockmath.com/",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
      "sameAs": ["https://www.buymeacoffee.com/clockmath","https://www.clockmath.com"],
      // Good extras:
      softwareVersion: "1.0.0",                 // update when you ship changes
      inLanguage: "en",
      author: {
        "@type": "Person",
        name: "Mark",
        url: "https://clockmath.com/",
        logo: "https://clockmath.com/logo.png",
        image: "https://clockmath.com/og.png",
        browserRequirements: "Requires JavaScript and a modern browser",
        releaseNotes: "Added copy/share link and Buy Me a Coffee button.",
      },
      // Optional but nice to have when you have them:
      // aggregateRating: { "@type": "AggregateRating", ratingValue: "5", ratingCount: 12 },
      // review: { "@type": "Review", reviewRating: { "@type":"Rating", ratingValue:"5" }, author:{ "@type":"Person", name:"…" } },
    })
  }}
/>

        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm text-foreground dark:text-slate-200 rounded-xl hover:bg-card dark:hover:bg-slate-700 transition-all duration-200 shadow-lg border border-border/50 dark:border-slate-700/50"
                title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              >
                {isDarkMode ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    Light Mode
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                    Dark Mode
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-lg border border-slate-700 dark:border-slate-600">
                {/* Clock SVG restored */}
                <svg width="80" height="80" viewBox="0 0 80 80" className="w-12 sm:w-16 h-12 sm:h-16">
                  {/* Clock face */}
                  <circle cx="40" cy="40" r="39.5" fill="white" stroke="#1e293b" strokeWidth="1" />

                  {/* Mathematical operators as hour markers */}
                  <text x="40" y="15" textAnchor="middle" className="text-sm font-bold fill-emerald-600">
                    +
                  </text>
                  <text x="65" y="45" textAnchor="middle" className="text-sm font-bold fill-emerald-600">
                    ×
                  </text>
                  <text x="40" y="70" textAnchor="middle" className="text-sm font-bold fill-red-500">
                    ÷
                  </text>
                  <text x="15" y="45" textAnchor="middle" className="text-sm font-bold fill-red-500">
                    −
                  </text>

                  {/* Clock hands */}
                  <line x1="40" y1="40" x2="40" y2="25" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                  <line x1="40" y1="40" x2="52" y2="40" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />

                  {/* Center dot */}
                  <circle cx="40" cy="40" r="2" fill="#1e293b" />

                  {/* Equals sign accent */}
                  <text x="58" y="28" textAnchor="middle" className="text-xs font-bold fill-amber-500">
                    =
                  </text>
                </svg>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Clock</span>{" "}
                <span className="text-blue-600 dark:text-blue-400">Math</span>
              </h1>
              <p className="text-slate-700 dark:text-emerald-200 text-base sm:text-lg font-medium">
                Professional Time Calculator
              </p>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <ToolsNavigation 
            currentTool="calculator"
          />
        </div>

        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-border/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-slate-100 mb-2">
                    Time Calculator
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground dark:text-slate-400">
                    Calculate the total time between two times. Handles crossing midnight automatically.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleTimeFormat}
                    className="px-3 sm:px-4 py-2 text-sm font-medium bg-gradient-to-r from-secondary to-secondary/80 dark:from-slate-700 dark:to-slate-600 text-secondary-foreground dark:text-slate-200 rounded-xl hover:from-secondary/80 hover:to-secondary dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-200 shadow-sm shrink-0"
                  >
                    {is24HourFormat ? "24h" : "12h"} format
                  </button>
                </div>
              </div>

              <form className="grid gap-4 sm:gap-6 mb-6 sm:mb-8" aria-label="Time inputs">
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <label
                      htmlFor="start"
                      className="block text-xs sm:text-sm font-semibold text-foreground dark:text-slate-200 uppercase tracking-wide"
                    >
                      Start Time
                    </label>
                    <div className="relative">
                      {is24HourFormat ? (
                        <input
                          id="start"
                          name="start"
                          type="time"
                          step="1"
                          value={startTime}
                          onChange={(e) => { setStartTime(e.target.value); emitInputsChange(); }}
                          className={`w-full px-3 sm:px-4 py-3 sm:py-4 bg-input dark:bg-slate-700 border-2 ${
                            startTimeValid ? "border-border dark:border-slate-600" : "border-red-500 dark:border-red-400"
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base sm:text-lg font-mono shadow-sm dark:text-slate-100`}
                          required
                        />
                      ) : (
                        <input
                          id="start"
                          name="start"
                          type="text"
                          placeholder="9:00 AM"
                          value={startTime ? formatTimeDisplay(startTime) : ""}
                          onChange={(e) => {
                            const input = e.target.value;
                            const converted = convertTo24Hour(input);
                            if (converted || !input) {
                              setStartTime(converted || "");
                              emitInputsChange();
                            }
                          }}
                          className={`w-full px-3 sm:px-4 py-3 sm:py-4 bg-input dark:bg-slate-700 border-2 ${
                            startTimeValid ? "border-border dark:border-slate-600" : "border-red-500 dark:border-red-400"
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base sm:text-lg font-mono shadow-sm dark:text-slate-100`}
                          required
                        />
                      )}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label
                      htmlFor="end"
                      className="block text-xs sm:text-sm font-semibold text-foreground dark:text-slate-200 uppercase tracking-wide"
                    >
                      End Time
                    </label>
                    <div className="relative">
                      {is24HourFormat ? (
                        <input
                          id="end"
                          name="end"
                          type="time"
                          step="1"
                          value={endTime}
                          onChange={(e) => { setEndTime(e.target.value); emitInputsChange(); }}
                          className={`w-full px-3 sm:px-4 py-3 sm:py-4 bg-input dark:bg-slate-700 border-2 ${
                            endTimeValid ? "border-border dark:border-slate-600" : "border-red-500 dark:border-red-400"
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base sm:text-lg font-mono shadow-sm dark:text-slate-100`}
                          required
                        />
                      ) : (
                        <input
                          id="end"
                          name="end"
                          type="text"
                          placeholder="9:00 AM"
                          value={endTime ? formatTimeDisplay(endTime) : ""}
                          onChange={(e) => {
                            const input = e.target.value;
                            const converted = convertTo24Hour(input);
                            if (converted || !input) {
                              setEndTime(converted || "");
                              emitInputsChange();
                            }
                          }}
                          className={`w-full px-3 sm:px-4 py-3 sm:py-4 bg-input dark:bg-slate-700 border-2 ${
                            endTimeValid ? "border-border dark:border-slate-600" : "border-red-500 dark:border-red-400"
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base sm:text-lg font-mono shadow-sm dark:text-slate-100`}
                          required
                        />
                      )}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
                      {assumeNextDay && (
                        <span className="absolute z-10 right-3 top-2 text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300/50">
                          +1d applied
                        </span>
                      )}
                    </div>  
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 sm:p-4 bg-muted/50 dark:bg-slate-700/50 rounded-xl border border-border/50 dark:border-slate-600/50">
                  <input
                    id="assume-next-day"
                    type="checkbox"
                    checked={assumeNextDay}
                    onChange={(e) => { setAssumeNextDay(e.target.checked); emitInputsChange(); }}
                    className="mt-1 w-4 h-4 text-primary bg-input dark:bg-slate-700 border-2 border-border dark:border-slate-600 rounded focus:ring-primary focus:ring-2 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor="assume-next-day"
                      className="text-sm font-medium text-foreground dark:text-slate-200 block"
                    >
                      End time is next day (+1 day)
                    </label>
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
                      When ON, always treat end time as the following day (+1d). When OFF, we still auto-handle crossing midnight if end &lt; start.
                    </p>
                  </div>
                </div>
              </form>

              <div className="mb-6 sm:mb-8">
                <button
                  type="button"
                  onClick={handleCalculate}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-400 hover:shadow-lg transition-all duration-200 font-medium shadow-sm text-base sm:text-lg"
                >
                  Calculate
                </button>
              </div>
              
              {!isCalculating && prominentElapsed && (
  <div
    className="mb-6 sm:mb-8 rounded-xl border border-emerald-200/60 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-900/20 p-4 sm:p-5 shadow-inner"
    aria-live="polite"
    role="status"
  >
    <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
      Elapsed
    </div>
    <div className="mt-1 text-3xl sm:text-4xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
      {prominentElapsed}
    </div>
  </div>
)}

              <section
                className="bg-gradient-to-br from-muted/80 to-muted/40 dark:from-slate-700/80 dark:to-slate-700/40 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border/50 dark:border-slate-600/50 shadow-inner"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                  <h3 className="text-lg sm:text-xl font-bold text-foreground dark:text-slate-100">
                    Calculation Result
                  </h3>
                  {isCalculating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                  )}
                </div>
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-sm dark:text-slate-200 transition-opacity duration-200 ${
                    isCalculating ? "opacity-50" : "opacity-100"
                  }`}
                  id="result"
                  dangerouslySetInnerHTML={{ __html: result }}
                />
              </section>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                <button
                  id="copy-btn"
                  type="button"
                  onClick={handleCopyResult}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary hover:shadow-lg transition-all duration-200 font-medium shadow-sm text-sm sm:text-base"
                >
                  Copy Result
                </button>
                <button
                  id="copy-link-btn"
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground rounded-xl hover:from-secondary/80 hover:to-secondary hover:shadow-lg transition-all duration-200 font-medium shadow-sm text-sm sm:text-base"
                >
                  Copy Link
                </button>
                <button
                  id="share-btn"
                  type="button"
                  onClick={handleShare}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-accent to-accent/90 text-accent-foreground rounded-xl hover:from-accent/90 hover:to-accent hover:shadow-lg transition-all duration-200 font-medium shadow-sm text-sm sm:text-base"
                >
                  Share
                </button>
                <button
                  id="clear"
                  type="button"
                  onClick={handleClear}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-muted to-muted/80 text-muted-foreground rounded-xl hover:from-muted/80 hover:to-muted hover:shadow-lg transition-all duration-200 font-medium shadow-sm text-sm sm:text-base"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-border/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-foreground truncate">Recent Calculations</h3>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium shrink-0"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-sm text-muted-foreground">No calculations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Calculate" to save results here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                  {history.map((item, index) => {
                    const elapsedMatch = item.result.match(/<strong>(.*?)<\/strong>/)
                    const elapsedTime = elapsedMatch ? elapsedMatch[1] : "—"

                    return (
                      <div
                        key={item.id}
                        className="p-3 sm:p-4 bg-gradient-to-r from-muted/50 to-muted/30 dark:from-slate-700/50 dark:to-slate-600/30 rounded-xl border border-border/30 dark:border-slate-600/30"
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-slate-400 mb-2">
                          <span className="font-medium">{item.timestamp.toLocaleDateString()}</span>
                          <span className="font-mono">
                            {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Start:</span>
                            <span className="font-mono bg-background/50 dark:bg-slate-700/50 px-2 py-1 rounded text-xs">
                              {formatTimeDisplay(item.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">End:</span>
                            <span className="font-mono bg-background/50 dark:bg-slate-700/50 px-2 py-1 rounded text-xs">
                              {formatTimeDisplay(item.endTime)}
                              {item.assumeNextDay && <span className="text-accent ml-1">(+1d)</span>}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm pt-1 border-t border-border/30 dark:border-slate-600/30">
                            <span className="text-muted-foreground font-medium">Elapsed:</span>
                            <span className="font-mono font-bold text-primary dark:text-accent">{elapsedTime}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 sm:mt-12 bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-border/50 dark:border-slate-700/50">
          <details className="group">
            <summary className="cursor-pointer font-bold text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-3 hover:text-primary dark:hover:text-accent transition-colors">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-open:rotate-90 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7m0 0l-5 5 5 5" />
              </svg>
              What's shown in the results
            </summary>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 text-sm dark:text-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-muted/30 dark:bg-slate-700/30 rounded-lg">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary/20 to-accent/20 dark:from-primary/10 dark:to-accent/10 text-primary dark:text-accent rounded-lg text-xs font-bold shrink-0">
                  HH:MM:SS
                </span>
                <span className="text-muted-foreground dark:text-slate-400 text-xs sm:text-sm">
                  Formatted hours, minutes, seconds
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-muted/30 dark:bg-slate-700/30 rounded-lg">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary/20 to-accent/20 dark:from-primary/10 dark:to-accent/10 text-primary dark:text-accent rounded-lg text-xs font-bold shrink-0">
                  Minutes
                </span>
                <span className="text-muted-foreground dark:text-slate-400 text-xs sm:text-sm">
                  Total whole minutes
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-muted/30 dark:bg-slate-700/30 rounded-lg">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary/20 to-accent/20 dark:from-primary/10 dark:to-accent/10 text-primary dark:text-accent rounded-lg text-xs font-bold shrink-0">
                  Decimal hours
                </span>
                <span className="text-muted-foreground dark:text-slate-400 text-xs sm:text-sm">
                  e.g., 2:30:00 → 2.5
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-muted/30 dark:bg-slate-700/30 rounded-lg">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary/20 to-accent/20 dark:from-primary/10 dark:to-accent/10 text-primary dark:text-accent rounded-lg text-xs font-bold shrink-0">
                  Seconds
                </span>
                <span className="text-muted-foreground dark:text-slate-400 text-xs sm:text-sm">Total seconds</span>
              </div>
            </div>
          </details>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/50 dark:border-slate-700/50">
            <p className="text-xs text-muted-foreground dark:text-slate-400 text-center leading-relaxed opacity-75">
              🔒 Your calculations stay private - stored locally on your device only
            </p>
          </div>
        </div>

        {/* Tools & Resources Section */}
        <div className="mt-8 sm:mt-12 bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-border/50 dark:border-slate-700/50">
          <h3 className="text-lg font-bold text-foreground dark:text-slate-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
📚 Calculation Guides & Articles
          </h3>
          

          {/* Resources Section */}
          <div>
            <h4 className="text-base font-semibold text-foreground dark:text-slate-100 mb-3">Calculation Guides</h4>
            <p className="text-sm text-muted-foreground dark:text-slate-400 mb-4">
              Learn more about time calculations with our helpful guides and tutorials.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/articles/work-hours-calculator"
              onClick={() => gaEvent({ action: "cta_article_click", params: { page: "calculator", article: "work-hours-calculator" } })}
              className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-100">
                Calculate Work Hours
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                Track employee hours and payroll calculations
              </p>
            </a>
            <a
              href="/articles/sleep-hours-calculator"
              onClick={() => gaEvent({ action: "cta_article_click", params: { page: "calculator", article: "sleep-hours-calculator" } })}
              className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-100">
                Sleep Hours Calculator
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Track your sleep duration and patterns
              </p>
            </a>
            <a
              href="/articles/overtime-hours-calculator"
              onClick={() => gaEvent({ action: "cta_article_click", params: { page: "calculator", article: "overtime-hours-calculator" } })}
              className="p-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg border border-amber-200 dark:border-amber-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-100">
                Overtime Calculator
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Calculate overtime pay and hours worked
              </p>
            </a>
            <a
              href="/articles/study-time-calculator"
              onClick={() => gaEvent({ action: "cta_article_click", params: { page: "calculator", article: "study-time-calculator" } })}
              className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 text-sm group-hover:text-purple-600 dark:group-hover:text-purple-100">
                Study Time Tracker
              </h4>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                Measure and optimize your study sessions
              </p>
            </a>
            <a
              href="/articles/time-between-dates-calculator"
              onClick={() => gaEvent({ action: "cta_article_click", params: { page: "calculator", article: "time-between-dates-calculator" } })}
              className="p-3 bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 rounded-lg border border-rose-200 dark:border-rose-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-rose-800 dark:text-rose-200 text-sm group-hover:text-rose-600 dark:group-hover:text-rose-100">
                Time Between Dates
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                Calculate duration between any two dates
              </p>
            </a>
            <a
              href="/articles/hours-calculator-online"
              onClick={() => gaEvent({ action: "cta_article_click", params: { page: "calculator", article: "hours-calculator-online" } })}
              className="p-3 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg border border-teal-200 dark:border-teal-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-teal-800 dark:text-teal-200 text-sm group-hover:text-teal-600 dark:group-hover:text-teal-100">
                Online vs Manual Math
              </h4>
              <p className="text-xs text-teal-700 dark:text-teal-300 mt-1">
                Why online calculators beat manual calculations
              </p>
            </a>
            <a
              href="/articles/timezone-converter-remote-work-meetings"
              onClick={() => gaEvent({ action: "cta_article_click", params: { page: "calculator", article: "timezone-converter-remote-work-meetings" } })}
              className="p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-100">
                Remote Work Timezones
              </h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                Schedule global meetings without confusion
              </p>
            </a>
            <a
              href="/articles/travel-timezone-converter"
              onClick={() => gaEvent({ action: "cta_article_click", params: { page: "calculator", article: "travel-timezone-converter" } })}
              className="p-3 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg border border-cyan-200 dark:border-cyan-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-cyan-800 dark:text-cyan-200 text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-100">
                Travel Time Planning
              </h4>
              <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">
                Plan international trips with timezone conversion
              </p>
            </a>
            <a
              href="/articles/timezone-converter-gaming-events"
              onClick={() => gaEvent({ action: "cta_article_click", params: { page: "calculator", article: "timezone-converter-gaming-events" } })}
              className="p-3 bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 rounded-lg border border-violet-200 dark:border-violet-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-violet-800 dark:text-violet-200 text-sm group-hover:text-violet-600 dark:group-hover:text-violet-100">
                Gaming & Esports Times
              </h4>
              <p className="text-xs text-violet-700 dark:text-violet-300 mt-1">
                Never miss game releases or tournaments
              </p>
            </a>
            <a
              href="/articles/stock-market-timezone-converter"
              onClick={() => gaEvent({ action: "cta_article_click", params: { page: "calculator", article: "stock-market-timezone-converter" } })}
              className="p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-green-800 dark:text-green-200 text-sm group-hover:text-green-600 dark:group-hover:text-green-100">
                Stock Market Hours
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Track global market opens and closes
              </p>
            </a>
            <a
              href="/articles/timezone-converter-family-calls"
              onClick={() => gaEvent({ action: "cta_article_click", params: { page: "calculator", article: "timezone-converter-family-calls" } })}
              className="p-3 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg border border-pink-200 dark:border-pink-800 hover:shadow-md transition-all duration-200 group"
            >
              <h4 className="font-semibold text-pink-800 dark:text-pink-200 text-sm group-hover:text-pink-600 dark:group-hover:text-pink-100">
                Family & Friends Calls
              </h4>
              <p className="text-xs text-pink-700 dark:text-pink-300 mt-1">
                Perfect timing for international calls
              </p>
            </a>
            </div>
          </div>
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}
