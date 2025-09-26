"use client"

/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useCallback, useRef } from "react"
import SeoIntro from "@/components/SeoIntro"
import SiteFooter from "@/components/SiteFooter"
import PageChrome from "@/components/PageChrome"
import { CustomTimePicker } from "@/components/ui/CustomTimePicker"
import { event as gaEvent } from "@/lib/gtag"

// Interface for calculator-specific data
interface CalculationHistory {
  id: string
  startTime: string
  endTime: string
  assumeNextDay: boolean
  result: string
  timestamp: Date
}

// Helper function for device detection
function getDevice(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia?.("(pointer: coarse)")?.matches ? "mobile" : "desktop";
}

type StoredCalculation = Omit<CalculationHistory, "timestamp"> & { timestamp: string };

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

  // State for custom time picker (both 12h and 24h)
  const [showCustomPicker, setShowCustomPicker] = useState<{ 
    field: 'start' | 'end' | null;
    is24h: boolean;
  }>({ field: null, is24h: false });

  // Helper to parse current time into components
  const parseCurrentTime = useCallback((timeStr: string, is24h: boolean) => {
    if (!timeStr) return { hour: is24h ? 9 : 9, minute: 0, period: 'AM' };
    
    const parts = timeStr.split(':');
    let hour = parseInt(parts[0], 10) || 0;
    const minute = parseInt(parts[1], 10) || 0;
    
    if (is24h) {
      return { hour, minute, period: 'AM' };
    } else {
      // Convert 24h to 12h for display
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return { hour: displayHour, minute, period };
    }
  }, []);

  // Helper to format time components back to time string
  const formatTimeComponents = useCallback((hour: number, minute: number, period: string, is24h: boolean) => {
    if (is24h) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    } else {
      // Convert 12h to 24h for storage
      let hour24 = hour;
      if (period === 'AM' && hour === 12) hour24 = 0;
      if (period === 'PM' && hour !== 12) hour24 = hour + 12;
      return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    }
  }, []);

  const parseTimeToSeconds = useCallback((str: string): number => {
    if (!str) return Number.NaN
    const parts = str.split(":")
    if (parts.length < 2) return Number.NaN
    const hours = parseInt(parts[0]) || 0
    const minutes = parseInt(parts[1]) || 0
    const seconds = parseInt(parts[2]) || 0
    return hours * 3600 + minutes * 60 + seconds
  }, [])

  const formatDuration = useCallback((seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "Invalid"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
    
    return parts.join(" ")
  }, [])

  const formatTime = useCallback((timeStr: string): string => {
    if (!timeStr || timeStr.length === 0) return ""
    
    const parts = timeStr.split(":")
    if (parts.length < 2) return timeStr
    
    const hours = parseInt(parts[0]) || 0
    const minutes = parseInt(parts[1]) || 0
    
    if (is24HourFormat) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    } else {
      const period = hours >= 12 ? "PM" : "AM"
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
    }
  }, [is24HourFormat])

  const validateTime = useCallback((timeStr: string): boolean => {
    if (!timeStr) return true // Empty is valid
    const parts = timeStr.split(":")
    if (parts.length < 2) return false
    const hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    return !isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60
  }, [])

  const calculateTimeDifference = useCallback(() => {
    if (!startTime || !endTime) return

    setIsCalculating(true)
    // Simulate calculation delay for animation
    setTimeout(() => {
      const startSeconds = parseTimeToSeconds(startTime)
      let endSeconds = parseTimeToSeconds(endTime)
      
      if (isNaN(startSeconds) || isNaN(endSeconds)) {
        setResult("Invalid time format")
        setIsCalculating(false)
        return
      }
      
      // If end is before start and assumeNextDay is true, add 24 hours to end
      if (assumeNextDay) {
        endSeconds += 24 * 3600
      }
      
      const diffSeconds = endSeconds - startSeconds
      
      if (diffSeconds < 0) {
        setResult("End time is before start time")
      } else {
        const duration = formatDuration(diffSeconds)
        setResult(duration)
        setProminentElapsed(duration)
        
        // Add to history
        const newEntry: CalculationHistory = {
          id: Date.now().toString(),
          startTime,
          endTime,
          assumeNextDay,
          result: duration,
          timestamp: new Date()
        }
        setHistory(prev => [newEntry, ...prev.slice(0, 9)]) // Keep last 10
        
        // Save to localStorage
        const storageEntry: StoredCalculation = {
          ...newEntry,
          timestamp: newEntry.timestamp.toISOString()
        }
        try {
          const existing = JSON.parse(localStorage.getItem("clockmath-history") || "[]")
          const updated = [storageEntry, ...existing.slice(0, 9)]
          localStorage.setItem("clockmath-history", JSON.stringify(updated))
        } catch (e) {
          console.warn("Failed to save to localStorage", e)
        }

        // Analytics
        gaEvent({
          action: "calculation_completed",
          params: {
            page: "calculator",
            duration_seconds: diffSeconds,
            has_next_day: assumeNextDay,
            device: getDevice(),
          },
        });
      }
      
      setIsCalculating(false)
    }, 300)
  }, [startTime, endTime, assumeNextDay, parseTimeToSeconds, formatDuration])

  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem("clockmath-darkmode", newTheme.toString())
  }, [isDarkMode])

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("clockmath-history")
      if (saved) {
        const parsed: StoredCalculation[] = JSON.parse(saved)
        const converted: CalculationHistory[] = parsed.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setHistory(converted)
      }
    } catch (e) {
      console.warn("Failed to load history from localStorage", e)
    }
  }, [])

  // Validate times
  useEffect(() => {
    setStartTimeValid(validateTime(startTime))
    setEndTimeValid(validateTime(endTime))
  }, [startTime, endTime, validateTime])

  // Debounced inputs change event
  const debouncedInputsChange = useRef<NodeJS.Timeout>()
  useEffect(() => {
    if (debouncedInputsChange.current) {
      clearTimeout(debouncedInputsChange.current)
    }
    debouncedInputsChange.current = setTimeout(emitInputsChange, 1000)
    
    return () => {
      if (debouncedInputsChange.current) {
        clearTimeout(debouncedInputsChange.current)
      }
    }
  }, [emitInputsChange])

  return (
    <PageChrome currentTool="calculator" onToggleTheme={toggleTheme} isDarkMode={isDarkMode}>
      <div className="space-y-8">
        {/* Header */}
        <header className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-lg border border-slate-700 dark:border-slate-600">
                {/* Clock Calculator Icon */}
                <svg width="80" height="80" viewBox="0 0 80 80" className="w-12 sm:w-16 h-12 sm:h-16">
                  <circle cx="40" cy="40" r="39.5" fill="white" stroke="#1e293b" strokeWidth="1"></circle>
                  <text x="40" y="15" textAnchor="middle" className="text-xs font-bold fill-emerald-600">+</text>
                  <text x="65" y="45" textAnchor="middle" className="text-xs font-bold fill-emerald-600">×</text>
                  <text x="40" y="70" textAnchor="middle" className="text-xs font-bold fill-red-500">÷</text>
                  <text x="15" y="45" textAnchor="middle" className="text-xs font-bold fill-red-500">−</text>
                  <line x1="40" y1="40" x2="40" y2="25" stroke="#059669" strokeWidth="2" strokeLinecap="round"></line>
                  <line x1="40" y1="40" x2="52" y2="40" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"></line>
                  <circle cx="40" cy="40" r="1.5" fill="#1e293b"></circle>
                </svg>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Clock</span>{" "}
                <span className="text-blue-600 dark:text-blue-400">Math</span>
              </h1>
              <p className="text-slate-700 dark:text-emerald-200 text-base sm:text-lg font-medium">
                Time Calculator
              </p>
            </div>
          </div>
        </header>

        {/* Main Calculator Card */}
        <div className="bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-border/50 dark:border-slate-700/50">
          <div className="grid gap-6 sm:gap-8">
            {/* Time Format Toggle */}
            <div className="flex items-center justify-center">
              <div className="bg-muted/50 dark:bg-slate-700/50 rounded-xl p-1.5 flex items-center gap-1">
                <button
                  onClick={() => setIs24HourFormat(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !is24HourFormat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  12h
                </button>
                <button
                  onClick={() => setIs24HourFormat(true)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    is24HourFormat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  24h
                </button>
              </div>
            </div>

            {/* Time Inputs */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Start Time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground dark:text-slate-100">
                  Start Time
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowCustomPicker({ field: 'start', is24h: is24HourFormat })}
                    className={`w-full px-4 py-3 text-left bg-background dark:bg-slate-700 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      startTimeValid
                        ? "border-border dark:border-slate-600 hover:border-primary/50"
                        : "border-red-500 dark:border-red-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-lg ${startTime ? "text-foreground dark:text-slate-100" : "text-muted-foreground"}`}>
                        {startTime ? formatTime(startTime) : "Select time"}
                      </span>
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                    </div>
                  </button>
                  {!startTimeValid && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Please enter a valid time
                    </p>
                  )}
                </div>
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground dark:text-slate-100">
                  End Time
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowCustomPicker({ field: 'end', is24h: is24HourFormat })}
                    className={`w-full px-4 py-3 text-left bg-background dark:bg-slate-700 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      endTimeValid
                        ? "border-border dark:border-slate-600 hover:border-primary/50"
                        : "border-red-500 dark:border-red-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-lg ${endTime ? "text-foreground dark:text-slate-100" : "text-muted-foreground"}`}>
                        {endTime ? formatTime(endTime) : "Select time"}
                      </span>
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                    </div>
                  </button>
                  {!endTimeValid && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Please enter a valid time
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Next Day Option */}
            <div className="flex items-center justify-center">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={assumeNextDay}
                    onChange={(e) => setAssumeNextDay(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-md border-2 transition-all duration-200 ${
                    assumeNextDay
                      ? "bg-primary border-primary"
                      : "border-border dark:border-slate-600 group-hover:border-primary/50"
                  }`}>
                    {assumeNextDay && (
                      <svg className="w-4 h-4 text-primary-foreground absolute top-0.5 left-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="20,6 9,17 4,12" strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-foreground dark:text-slate-100 font-medium group-hover:text-primary transition-colors">
                  End time is next day
                </span>
              </label>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateTimeDifference}
              disabled={!startTimeValid || !endTimeValid || !startTime || !endTime || isCalculating}
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:from-muted disabled:to-muted disabled:text-muted-foreground text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCalculating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  Calculate Duration
                </>
              )}
            </button>

            {/* Result */}
            {result && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                  <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                    Duration
                  </h3>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 font-mono">
                    {result}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/50 dark:border-slate-700/50">
            <h3 className="text-lg font-bold text-foreground dark:text-slate-100 mb-4">
              Recent Calculations
            </h3>
            <div className="grid gap-3">
              {history.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-background/50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-muted-foreground">
                      {formatTime(entry.startTime)} → {formatTime(entry.endTime)}
                      {entry.assumeNextDay && " (+1 day)"}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-primary">
                    {entry.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Time Picker Modal */}
        {showCustomPicker.field && (
          <CustomTimePicker
            field={showCustomPicker.field}
            is24h={showCustomPicker.is24h}
            currentTime={showCustomPicker.field === 'start' ? startTime : endTime}
            onSelect={(timeStr) => {
              if (showCustomPicker.field === 'start') {
                setStartTime(timeStr);
              } else {
                setEndTime(timeStr);
              }
              setShowCustomPicker({ field: null, is24h: false });
            }}
            onClose={() => setShowCustomPicker({ field: null, is24h: false })}
            title={`Select ${showCustomPicker.field === 'start' ? 'Start' : 'End'} Time`}
          />
        )}

        <SeoIntro prominentElapsed={prominentElapsed} />
        <SiteFooter />
      </div>
    </PageChrome>
  )
}
