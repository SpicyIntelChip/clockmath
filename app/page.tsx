"use client"

/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useCallback, useRef } from "react"
import SeoIntro from "@/components/SeoIntro"
import SiteFooter from "@/components/SiteFooter"
import PageChrome from "@/components/PageChrome"
import { InlineTimePicker } from "@/components/ui/InlineTimePicker"
import { InlineDatePicker } from "@/components/ui/InlineDatePicker"
import { DetailedDurationBreakdown } from "@/components/DetailedDurationBreakdown"
import { format } from "date-fns"
import { event as gaEvent } from "@/lib/gtag"
import JsonLd, { getSoftwareApplicationSchema } from "@/components/JsonLd"

// Interface for calculator-specific data
interface CalculationHistory {
  id: string
  startDate: string  // ISO date string
  startTime: string
  endDate: string    // ISO date string
  endTime: string
  result: string
  seconds?: number // Raw seconds value for efficient sum calculations (optional for backward compatibility)
  detailedResult?: {
    years: number
    months: number
    weeks: number
    days: number
    hours: number
    minutes: number
    seconds: number
  }
  timestamp: Date
}

// Helper function for device detection
function getDevice(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia?.("(pointer: coarse)")?.matches ? "mobile" : "desktop";
}

type StoredCalculation = Omit<CalculationHistory, "timestamp"> & { timestamp: string };

export default function ClockMathPage() {
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState("09:00:00")
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [endTime, setEndTime] = useState("17:30:00")
  const [result, setResult] = useState("")
  const [history, setHistory] = useState<CalculationHistory[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(new Set());
  const [selectedCalculations, setSelectedCalculations] = useState<Set<string>>(new Set());
  const [currentDetailedResult, setCurrentDetailedResult] = useState<{
    years: number
    months: number
    weeks: number
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null);
  const [sumResult, setSumResult] = useState<{
    total: string
    detailed: {
      years: number
      months: number
      weeks: number
      days: number
      hours: number
      minutes: number
      seconds: number
    }
  } | null>(null);

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

  // Global time format for both start and end times
  const [is24HourFormat, setIs24HourFormat] = useState(true)

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

    const totalDays = Math.floor(seconds / 86400)
    const totalHours = Math.floor(seconds / 3600)
    const remainingHours = Math.floor((seconds % 86400) / 3600)
    const remainingMinutes = Math.floor((seconds % 3600) / 60)
    const remainingSecs = seconds % 60

    // Less than a day: show hours, minutes, seconds
    if (totalDays === 0) {
      const parts = []
      if (totalHours > 0) parts.push(`${totalHours}h`)
      if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`)
      if (remainingSecs > 0 || parts.length === 0) parts.push(`${remainingSecs}s`)
      return parts.join(" ")
    }

    // Less than a year: show days, hours, minutes
    const totalYears = Math.floor(totalDays / 365)
    const totalMonths = Math.floor(totalDays / 30.44)

    if (totalYears === 0) {
      if (totalMonths >= 1) {
        // Show months and remaining days
        const remainingDays = Math.floor(totalDays % 30.44)
        const parts = []
        parts.push(`${totalMonths} month${totalMonths !== 1 ? 's' : ''}`)
        if (remainingDays > 0) parts.push(`${remainingDays} day${remainingDays !== 1 ? 's' : ''}`)
        return parts.join(", ")
      } else {
        // Show days and hours
        const parts = []
        parts.push(`${totalDays} day${totalDays !== 1 ? 's' : ''}`)
        if (remainingHours > 0) parts.push(`${remainingHours}h`)
        if (remainingMinutes > 0 && totalDays < 7) parts.push(`${remainingMinutes}m`)
        return parts.join(", ")
      }
    }

    // Years: show years, months, days
    const remainingMonths = Math.floor((totalDays % 365) / 30.44)
    const remainingDays = Math.floor((totalDays % 365) % 30.44)
    const parts = []
    parts.push(`${totalYears} year${totalYears !== 1 ? 's' : ''}`)
    if (remainingMonths > 0) parts.push(`${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`)
    if (remainingDays > 0) parts.push(`${remainingDays} day${remainingDays !== 1 ? 's' : ''}`)
    return parts.join(", ")
  }, [])

  const formatDetailedDuration = useCallback((seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return null

    // Calculate all time units with appropriate precision
    const years = seconds / (365.25 * 24 * 3600)
    const months = seconds / (30.44 * 24 * 3600)
    const weeks = seconds / (7 * 24 * 3600)
    const days = seconds / (24 * 3600)
    const hours = seconds / 3600
    const minutes = seconds / 60

    return {
      years: parseFloat(years.toFixed(4)),
      months: parseFloat(months.toFixed(3)),
      weeks: parseFloat(weeks.toFixed(2)),
      days: parseFloat(days.toFixed(2)),
      hours: parseFloat(hours.toFixed(2)),
      minutes: parseFloat(minutes.toFixed(1)),
      seconds: Math.round(seconds)
    }
  }, [])

  // Handle calculation selection
  const toggleCalculationSelection = useCallback((id: string) => {
    const newSelected = new Set(selectedCalculations)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCalculations(newSelected)
  }, [selectedCalculations])

  // Calculate sum of selected calculations
  const calculateSum = useCallback(() => {
    if (selectedCalculations.size === 0) return

    let totalSeconds = 0
    const selectedEntries = history.filter(entry => selectedCalculations.has(entry.id))
    
    selectedEntries.forEach(entry => {
      // Use stored seconds value directly (much more efficient!)
      if (entry.seconds && !isNaN(entry.seconds)) {
        totalSeconds += entry.seconds
      } else {
        // Fallback for old entries without seconds field (backward compatibility)
        const resultStr = entry.result
        if (resultStr && resultStr !== "Invalid") {
          // Parse "8h 30m" format
          const parts = resultStr.split(' ')
          parts.forEach(part => {
            if (part.endsWith('h')) {
              const hours = parseInt(part.replace('h', ''))
              if (!isNaN(hours)) totalSeconds += hours * 3600
            } else if (part.endsWith('m')) {
              const minutes = parseInt(part.replace('m', ''))
              if (!isNaN(minutes)) totalSeconds += minutes * 60
            } else if (part.endsWith('s')) {
              const seconds = parseInt(part.replace('s', ''))
              if (!isNaN(seconds)) totalSeconds += seconds
            }
          })
        }
      }
    })

    const totalDuration = formatDuration(totalSeconds)
    const detailedDuration = formatDetailedDuration(totalSeconds)
    
    if (detailedDuration) {
      setSumResult({
        total: totalDuration,
        detailed: detailedDuration
      })
    }
  }, [selectedCalculations, history, formatDuration, formatDetailedDuration])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedCalculations(new Set())
    setSumResult(null)
  }, [])

  const formatTime = useCallback((timeStr: string): string => {
    if (!timeStr || timeStr.length === 0) return ""
    
    // Handle edge case where timeStr might be an object or invalid data
    if (typeof timeStr !== 'string') {
      console.warn('Invalid timeStr type:', typeof timeStr, timeStr)
      return ""
    }
    
    const parts = timeStr.split(":")
    if (parts.length < 2) {
      console.warn('Invalid time format:', timeStr)
      return timeStr
    }
    
    const hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1], 10)
    
    // Validate parsed values
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60) {
      console.warn('Invalid time values:', { hours, minutes, timeStr })
      return timeStr
    }
    
    if (is24HourFormat) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    } else {
      const period = hours >= 12 ? "PM" : "AM"
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
    }
  }, [is24HourFormat])

  const calculateTimeDifference = useCallback(() => {
    if (!startTime || !endTime) return

    setIsCalculating(true)
    // Simulate calculation delay for animation
    setTimeout(() => {
      const startSeconds = parseTimeToSeconds(startTime)
      const endSeconds = parseTimeToSeconds(endTime)

      if (isNaN(startSeconds) || isNaN(endSeconds)) {
        setResult("Invalid time format")
        setIsCalculating(false)
        return
      }

      // Combine date and time into full datetime
      const startDateTime = new Date(startDate)
      startDateTime.setHours(Math.floor(startSeconds / 3600))
      startDateTime.setMinutes(Math.floor((startSeconds % 3600) / 60))
      startDateTime.setSeconds(startSeconds % 60)
      startDateTime.setMilliseconds(0)

      const endDateTime = new Date(endDate)
      endDateTime.setHours(Math.floor(endSeconds / 3600))
      endDateTime.setMinutes(Math.floor((endSeconds % 3600) / 60))
      endDateTime.setSeconds(endSeconds % 60)
      endDateTime.setMilliseconds(0)

      const diffMs = endDateTime.getTime() - startDateTime.getTime()
      const diffSeconds = Math.floor(diffMs / 1000)

      if (diffSeconds < 0) {
        setResult("End is before start")
      } else {
        const duration = formatDuration(diffSeconds)
        const detailedDuration = formatDetailedDuration(diffSeconds)
        setResult(duration)
        setCurrentDetailedResult(detailedDuration)

        // Add to history
        const newEntry: CalculationHistory = {
          id: Date.now().toString(),
          startDate: format(startDate, 'yyyy-MM-dd'),
          startTime,
          endDate: format(endDate, 'yyyy-MM-dd'),
          endTime,
          result: duration,
          seconds: diffSeconds, // Store raw seconds for efficient sum calculations
          detailedResult: detailedDuration || undefined,
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
        const daysDiff = Math.floor(diffSeconds / 86400)
        gaEvent({
          action: "calculation_completed",
          params: {
            page: "calculator",
            duration_seconds: diffSeconds,
            duration_days: daysDiff,
            is_multi_day: daysDiff > 0,
            device: getDevice(),
          },
        });
      }

      setIsCalculating(false)
    }, 300)
  }, [startDate, startTime, endDate, endTime, parseTimeToSeconds, formatDuration, formatDetailedDuration])

  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem("clockmath-darkmode", newTheme.toString())
  }, [isDarkMode])

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("clockmath-history")
      if (!saved) return
      
      const parsed = JSON.parse(saved)
      
      // Filter out entries missing required fields and convert timestamps
      const validEntries: CalculationHistory[] = parsed
        .filter((item: any) => 
          item && 
          item.id && 
          item.startTime && 
          item.endTime && 
          item.result && 
          item.timestamp
        )
        .map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        .filter((item: CalculationHistory) => !isNaN(item.timestamp.getTime()))
      
      setHistory(validEntries)
      
      // Clean up localStorage if we filtered out invalid entries
      if (validEntries.length !== parsed.length && validEntries.length > 0) {
        const cleanedStorage: StoredCalculation[] = validEntries.map(item => ({
          ...item,
          timestamp: item.timestamp.toISOString()
        }))
        localStorage.setItem("clockmath-history", JSON.stringify(cleanedStorage))
      }
    } catch (e) {
      console.warn("Failed to load history from localStorage", e)
      localStorage.removeItem("clockmath-history")
    }
  }, [])

  // Debounced inputs change event
  const debouncedInputsChange = useRef<NodeJS.Timeout | null>(null)
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
      <JsonLd
        data={getSoftwareApplicationSchema({
          name: 'ClockMath Time Duration Calculator',
          description: 'Calculate the time difference between two times instantly. Handles overnight shifts, shows results in hours, minutes, seconds, and decimal formats.',
          url: 'https://clockmath.com/',
        })}
      />
      <div className="space-y-8 pb-24">
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
        <div className="bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-border/50 dark:border-slate-700/50 min-h-[600px]">
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

            {/* Date and Time Inputs */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Start */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground dark:text-slate-100">
                  Start
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InlineDatePicker
                      value={startDate}
                      onChange={setStartDate}
                      placeholder="Select date"
                    />
                  </div>
                  <div className="flex-1">
                    <InlineTimePicker
                      value={startTime}
                      onChange={setStartTime}
                      is24h={is24HourFormat}
                      placeholder="Time"
                    />
                  </div>
                </div>
              </div>

              {/* End */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground dark:text-slate-100">
                  End
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InlineDatePicker
                      value={endDate}
                      onChange={setEndDate}
                      placeholder="Select date"
                    />
                  </div>
                  <div className="flex-1">
                    <InlineTimePicker
                      value={endTime}
                      onChange={setEndTime}
                      is24h={is24HourFormat}
                      placeholder="Time"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateTimeDifference}
              disabled={!startTime || !endTime || isCalculating}
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
                  <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-4">
                    Duration
                  </h3>
                  
                  {/* Main duration (hours and minutes) - largest and centered */}
                  <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-100 font-mono mb-4">
                    {result}
                  </p>
                  
                  {/* Detailed breakdown - smaller, for interest/fun */}
                  {currentDetailedResult && (
                    <DetailedDurationBreakdown 
                      detailedResult={currentDetailedResult}
                      variant="primary"
                      size="large"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground dark:text-slate-100">
                  Recent Calculations
                </h3>
                {history.length >= 2 && selectedCalculations.size === 0 && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span>💡</span>
                    <span>Tip: Select multiple calculations to sum them together</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedCalculations.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedCalculations.size} selected
                    </span>
                    <button
                      onClick={calculateSum}
                      className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors animate-in slide-in-from-right-2 duration-300"
                    >
                      Sum Selected
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem("clockmath-history");
                    setSelectedCalculations(new Set());
                    setSumResult(null);
                    gaEvent({
                      action: "history_cleared",
                      params: {
                        page: "calculator",
                        device: getDevice(),
                      },
                    });
                  }}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted dark:bg-slate-700/50 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  title="Clear all calculation history"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              {history.slice(0, 5).map((entry) => {
                const startTimeFormatted = formatTime(entry.startTime)
                const endTimeFormatted = formatTime(entry.endTime)
                const isExpanded = expandedHistory.has(entry.id)
                const isSelected = selectedCalculations.has(entry.id)

                // Format dates for display
                const formatEntryDate = (dateStr: string | undefined) => {
                  if (!dateStr) return null
                  try {
                    const date = new Date(dateStr)
                    const today = new Date()
                    const yesterday = new Date(today)
                    yesterday.setDate(yesterday.getDate() - 1)

                    if (dateStr === format(today, 'yyyy-MM-dd')) return 'Today'
                    if (dateStr === format(yesterday, 'yyyy-MM-dd')) return 'Yesterday'
                    return format(date, 'MMM d')
                  } catch {
                    return null
                  }
                }

                const startDateFormatted = formatEntryDate(entry.startDate)
                const endDateFormatted = formatEntryDate(entry.endDate)
                const isSameDay = entry.startDate === entry.endDate
                const isMultiDay = entry.startDate && entry.endDate && entry.startDate !== entry.endDate

                return (
                  <div
                    key={entry.id}
                    className={`bg-background/50 dark:bg-slate-700/50 rounded-lg overflow-hidden transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-primary/50 bg-primary/5 dark:bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center cursor-pointer group" title="Click to select for summing">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCalculationSelection(entry.id)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-border dark:border-slate-600 hover:border-primary/50 group-hover:scale-105'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-primary-foreground absolute top-0.5 left-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <polyline points="20,6 9,17 4,12" strokeWidth="2" />
                              </svg>
                            )}
                          </div>
                        </label>
                        <span className="font-mono text-sm text-muted-foreground">
                          {startTimeFormatted && endTimeFormatted ? (
                            <>
                              {isMultiDay && startDateFormatted && (
                                <span className="text-xs text-primary/70 mr-1">{startDateFormatted}</span>
                              )}
                              {startTimeFormatted}
                              <span className="mx-1">→</span>
                              {isMultiDay && endDateFormatted && (
                                <span className="text-xs text-primary/70 mr-1">{endDateFormatted}</span>
                              )}
                              {endTimeFormatted}
                            </>
                          ) : (
                            <span className="text-red-500 text-xs">
                              Invalid time data
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-primary">
                          {entry.result || "Invalid result"}
                        </span>
                        {entry.detailedResult && (
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedHistory)
                              if (isExpanded) {
                                newExpanded.delete(entry.id)
                              } else {
                                newExpanded.add(entry.id)
                              }
                              setExpandedHistory(newExpanded)
                            }}
                            className="p-1 hover:bg-muted/50 dark:hover:bg-slate-600 rounded transition-colors"
                            title={isExpanded ? "Hide details" : "Show details"}
                          >
                            <svg 
                              className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded details */}
                    {isExpanded && entry.detailedResult && (
                      <div className="px-3 pb-3 border-t border-border/50 dark:border-slate-600/50">
                        <div className="pt-3">
                          <div className="text-xs text-muted-foreground mb-2">Detailed breakdown:</div>
                          <DetailedDurationBreakdown 
                            detailedResult={entry.detailedResult}
                            variant="muted"
                            size="small"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Sum Result */}
        {sumResult && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800 animate-in fade-in-50 duration-500">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Sum of Selected Calculations
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
                ✨ Great! You've successfully summed {selectedCalculations.size} calculation{selectedCalculations.size !== 1 ? 's' : ''}
              </p>
              
              {/* Main sum result - largest and centered */}
              <p className="text-4xl font-bold text-blue-900 dark:text-blue-100 font-mono mb-4">
                {sumResult.total}
              </p>
              
              {/* Detailed breakdown */}
              <DetailedDurationBreakdown 
                detailedResult={sumResult.detailed}
                variant="secondary"
                size="large"
              />
            </div>
          </div>
        )}


        <SeoIntro />
        <SiteFooter />
      </div>
    </PageChrome>
  )
}
