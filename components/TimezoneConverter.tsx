/**
 * TimezoneConverter component for ClockMath.com
 * Main timezone conversion interface with live updates
 */


'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { LocationTimezonePicker } from '@/components/location/LocationTimezonePicker';
import { InlineTimePicker } from '@/components/ui/InlineTimePicker';
import {
  getUserTimeZone,
  getTimeZoneOptions,
  formatZoned,
  convertDateBetweenZones,
  parseDateTimeInZone,
  getTimezoneOffset,
  getOffsetLabel,
} from '@/lib/time';
import { ArrowLeftRight, Clock, Calendar, MapPin } from 'lucide-react';
import { event as gaEvent } from '@/lib/gtag';
import { toast } from '@/hooks/use-toast';

interface TimezoneConverterProps {
  className?: string;
}

export function TimezoneConverter({ className = '' }: TimezoneConverterProps) {
  const [fromTZ, setFromTZ] = useState<string>('');
  const [toTZ, setToTZ] = useState<string>('UTC');
  const [inputDate, setInputDate] = useState<string>('');
  const [inputTime, setInputTime] = useState<string>('');
  const [hour12, setHour12] = useState<boolean>(true);
  const [fromLocationDisplay, setFromLocationDisplay] = useState<string>('');
  const [toLocationDisplay, setToLocationDisplay] = useState<string>(''); // State for "To" location display
  const [fromPreset, setFromPreset] = useState<{ lat: number; lon: number } | null>(null);
  const [toPreset, setToPreset] = useState<{ lat: number; lon: number } | null>(null);
  const [result, setResult] = useState<{
    from: ReturnType<typeof formatZoned>;
    to: ReturnType<typeof formatZoned>;
    targetDate: Date;
  } | null>(null);
  
  // Custom time picker state
  
  // Track if component has hydrated to prevent SSR mismatch
  const [isHydrated, setIsHydrated] = useState(false);

  const timeZoneOptions = useMemo(() => {
    // Only compute timezone options after hydration to prevent SSR mismatch
    if (!isHydrated) return [];
    return getTimeZoneOptions();
  }, [isHydrated]);

  const displayForTZ = useCallback((tz: string) => {
    const opt = timeZoneOptions.find(o => o.id === tz);
    return opt ? opt.label.split(' (')[0] : (tz?.split('/').pop()?.replace(/_/g, ' ') || tz);
  }, [timeZoneOptions]);

  // Hydration effect - runs only on client
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize with user's timezone (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    
    const userTZ = getUserTimeZone();
    setFromTZ(userTZ);
    
    // Set initial date/time to now
    const now = new Date();
    setInputDate(now.toISOString().split('T')[0]);
    setInputTime(now.toTimeString().slice(0, 5));
    
    // Load hour12 preference from localStorage
    const saved12Hour = localStorage.getItem('clockmath-hour12');
    if (saved12Hour !== null) {
      setHour12(saved12Hour === 'true');
    } else {
      // Use locale preference
      const locale = Intl.DateTimeFormat().resolvedOptions();
      setHour12(locale.hour12 !== undefined ? locale.hour12 : true);
    }
  }, [isHydrated]);

  // Save hour12 preference (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof hour12 === 'boolean') {
      localStorage.setItem('clockmath-hour12', hour12.toString());
    }
  }, [hour12, isHydrated]);

  // Centralized calculation helper so we can reuse for swap
  const computeConversion = useCallback((from: string, to: string, opts?: { dateStr?: string; timeStr?: string }) => {
    if (!from || !to) {
      toast({
        title: 'Select locations',
        description: 'Choose both From and To to convert.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let sourceDate: Date;

      const dateStr = opts?.dateStr ?? inputDate;
      const timeStr = opts?.timeStr ?? inputTime;

      if (dateStr && timeStr) {
        sourceDate = parseDateTimeInZone(dateStr, timeStr, from);
      } else {
        sourceDate = new Date();
      }

      const targetDate = convertDateBetweenZones({
        fromTZ: from,
        toTZ: to,
        at: sourceDate
      });

      const fromFormatted = formatZoned(sourceDate, from, { hour12 });
      const toFormatted = formatZoned(targetDate, to, { hour12 });

      setResult({
        from: fromFormatted,
        to: toFormatted,
        targetDate
      });

      gaEvent({
        action: 'tz_convert',
        params: {
          from,
          to,
          hasCustomDatetime: Boolean(dateStr && timeStr),
          hour12,
          device: typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)')?.matches ? 'mobile' : 'desktop'
        }
      });
    } catch {
      setResult(null);
    }
  }, [hour12, inputDate, inputTime]);

  // Calculate conversion manually when user clicks Calculate
  const handleCalculate = useCallback(() => {
    computeConversion(fromTZ, toTZ);
  }, [computeConversion, fromTZ, toTZ]);

  const handleSwapTimezones = () => {
    if (!fromTZ || !toTZ) {
      toast({
        title: 'Select locations',
        description: 'Choose both From and To before swapping.',
        variant: 'destructive',
      });
      return;
    }
    // Swap timezone values
    const newFrom = toTZ;
    const newTo = fromTZ;
    setFromTZ(newFrom);
    setToTZ(newTo);
    
    // Update displays based on swapped timezones to avoid stale copying
    setFromLocationDisplay(displayForTZ(newFrom));
    setToLocationDisplay(displayForTZ(newTo));
    
    // Do NOT swap presets; presets represent pinned sources (like geolocation)
    // Swapping them causes auto-resolve effects to override selections.
    
    // If we have a prior result, use its target time as the new input time
    if (result) {
      try {
        const fmt = new Intl.DateTimeFormat('sv-SE', {
          timeZone: newFrom,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const formatted = fmt.format(result.targetDate);
        const [dateStr, timeStr] = formatted.split(' ');
        setInputDate(dateStr);
        setInputTime(timeStr);
        // Recompute using the swapped zones and the carried-over time
        computeConversion(newFrom, newTo, { dateStr, timeStr });
      } catch {
        computeConversion(newFrom, newTo);
      }
    } else {
      // No prior result, recompute with existing inputs
      computeConversion(newFrom, newTo);
    }

    gaEvent({
      action: 'tz_swap_clicked',
      params: { device: typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)')?.matches ? 'mobile' : 'desktop' }
    });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation unsupported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setFromPreset({ lat: latitude, lon: longitude });
          // Note: LocationTimezonePicker will compute IANA and call setFromTZ via onTimezoneResolved

          gaEvent({
            action: 'tz_geolocation_used',
            params: { device: typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)')?.matches ? 'mobile' : 'desktop' }
          });
        } catch {
          toast({
            title: 'Location error',
            description: 'Error processing your location.',
            variant: 'destructive',
          });
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast({
              title: 'Location access denied',
              description: 'Enable location permissions and try again. Tip: refresh and click Allow when prompted.',
              variant: 'destructive',
            });
            break;
          case error.POSITION_UNAVAILABLE:
            toast({
              title: 'Location unavailable',
              description: 'Location could not be determined. If on HTTP, try HTTPS.',
              variant: 'destructive',
            });
            break;
          case error.TIMEOUT:
            toast({
              title: 'Location timeout',
              description: 'Location request timed out. Please try again.',
              variant: 'destructive',
            });
            break;
          default:
            toast({
              title: 'Location error',
              description: 'An unknown error occurred while retrieving your location.',
              variant: 'destructive',
            });
            break;
        }
      },
      {
        timeout: 10000,
        enableHighAccuracy: true
      }
    );
  };

  const handleNowClick = () => {
    const now = new Date();
    
    if (fromTZ) {
      // Get what time it currently is in the "from" timezone
      const formatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: fromTZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const formatted = formatter.format(now);
      const [dateStr, timeStr] = formatted.split(' ');
      
      setInputDate(dateStr);
      setInputTime(timeStr);
    } else {
      // Fallback to local time if no timezone selected
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);
      
      setInputDate(dateStr);
      setInputTime(timeStr);
    }
    
    gaEvent({
      action: 'tz_now_clicked',
      params: { device: typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)')?.matches ? 'mobile' : 'desktop' }
    });
  };

  const handleClearAllClick = () => {
    setInputDate('');
    setInputTime('');
    setFromTZ('');
    setToTZ('');
    setFromLocationDisplay('');
    setToLocationDisplay('');
    setFromPreset(null);
    setToPreset(null);
    setResult(null);
  };

  const getFromZoneDisplayName = () => {
    // Prefer the user's chosen place label if available
    if (fromLocationDisplay) return fromLocationDisplay;
    const option = timeZoneOptions.find(opt => opt.id === fromTZ);
    return option ? option.label.split(' (')[0] : fromTZ;
  };

  const getToZoneDisplayName = () => {
    // Prefer the user's chosen place label if available
    if (toLocationDisplay) return toLocationDisplay;
    const option = timeZoneOptions.find(opt => opt.id === toTZ);
    return option ? option.label.split(' (')[0] : toTZ;
  };

  const getTimeDifference = () => {
    if (!result) return null;
    
    const fromOffset = getTimezoneOffset(fromTZ, result.targetDate);
    const toOffset = getTimezoneOffset(toTZ, result.targetDate);
    const diffMinutes = toOffset - fromOffset;
    const diffHours = diffMinutes / 60;
    
    if (diffHours === 0) {
      return "Same time";
    } else if (diffHours > 0) {
      const hours = Math.floor(Math.abs(diffHours));
      const minutes = Math.abs(diffMinutes) % 60;
      return minutes === 0 
        ? `${hours} hour${hours !== 1 ? 's' : ''} ahead`
        : `${hours}h ${minutes}m ahead`;
    } else {
      const hours = Math.floor(Math.abs(diffHours));
      const minutes = Math.abs(diffMinutes) % 60;
      return minutes === 0 
        ? `${hours} hour${hours !== 1 ? 's' : ''} behind`
        : `${hours}h ${minutes}m behind`;
    }
  };

  // Helper functions for time format conversion
  const convertTo24Hour = useCallback((time12h: string): string => {
    if (!time12h) return "";
    
    const time = time12h.trim().toUpperCase();
    const pmMatch = time.match(/(\d+):?(\d*)\s*(PM|P)/);
    const amMatch = time.match(/(\d+):?(\d*)\s*(AM|A)/);
    const noPeriodMatch = time.match(/(\d+):?(\d*)/);

    let h: number | undefined;
    let m: number | undefined;

    if (pmMatch) {
      h = Number.parseInt(pmMatch[1], 10);
      m = Number.parseInt(pmMatch[2] || "0", 10);
      if (h === 12) h = 12; // 12 PM is 12:00
      else h = (h % 12) + 12;
    } else if (amMatch) {
      h = Number.parseInt(amMatch[1], 10);
      m = Number.parseInt(amMatch[2] || "0", 10);
      if (h === 12) h = 0; // 12 AM is 00:00
      else h = h % 12;
    } else if (noPeriodMatch) {
      h = Number.parseInt(noPeriodMatch[1], 10);
      m = Number.parseInt(noPeriodMatch[2] || "0", 10);
      // Assume 24h format if no AM/PM and hour is > 12
      if (h > 12 && h <= 23) {
        // Valid 24h time
      } else if (h >= 1 && h <= 12) {
        // Could be 12h or 24h, default to 12h AM for simplicity if no period
      } else {
        return ""; // Invalid hour
      }
    } else {
      return ""; // No match
    }

    if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m) || m > 59 || h > 23) {
      return ""; // Invalid time components
    }

    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }, []);

  const formatTimeDisplay = useCallback((timeStr: string): string => {
    if (!timeStr) return "";
    
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    if (isNaN(hour) || isNaN(minute)) return timeStr;
    
    if (hour12) {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
    } else {
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }
  }, [hour12]);


  // Convert inputTime for display in the input field
  const displayTime = useMemo(() => {
    if (!isHydrated || !inputTime) return "";
    return formatTimeDisplay(inputTime);
  }, [inputTime, formatTimeDisplay, isHydrated]);

  return (
    <div className={`bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-border/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-slate-100 mb-2">
            Timezone Converter
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground dark:text-slate-400">
            Convert time between any two timezones. Handles DST automatically.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div className="bg-muted/50 dark:bg-slate-700/50 rounded-xl p-1.5 flex items-center gap-1">
            <button
              onClick={() => setHour12(true)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                hour12
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              12h
            </button>
            <button
              onClick={() => setHour12(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !hour12
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              24h
            </button>
          </div>
        </div>
      </div>

      {/* Streamlined Timezone Selectors */}
      <div className="grid gap-4 sm:gap-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* From Timezone */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-semibold text-foreground dark:text-slate-200 uppercase tracking-wide">
                From Location
              </label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <MapPin className="w-3 h-3" />
                Use my location
              </button>
            </div>
            <LocationTimezonePicker
              label=""
              onTimezoneResolved={(tz, placeName) => {
                setFromTZ(tz);
                if (placeName) {
                  setFromLocationDisplay(placeName);
                }
              }}
              onDisplayChange={(displayText) => {
                setFromLocationDisplay(displayText);
              }}
              defaultHint={isHydrated ? `Auto-detected: ${getUserTimeZone()}` : "Auto-detecting timezone..."}
              value={fromLocationDisplay}
              preset={fromPreset}
              timeZone={fromTZ}
              id="from-location"
              name="fromLocation"
            />
          </div>

          {/* To Timezone */}
          <div className="space-y-3 relative">
            <label className="block text-xs sm:text-sm font-semibold text-foreground dark:text-slate-200 uppercase tracking-wide">
              To Location
            </label>
            <LocationTimezonePicker
              label=""
              onTimezoneResolved={(tz, placeName) => {
                setToTZ(tz);
                if (placeName) {
                  setToLocationDisplay(placeName);
                }
              }}
              onDisplayChange={(displayText) => {
                setToLocationDisplay(displayText);
              }}
              defaultHint="Search for a city..."
              value={toLocationDisplay}
              preset={toPreset}
              timeZone={toTZ}
              id="to-location"
              name="toLocation"
            />
            
            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapTimezones}
              className="absolute top-8 right-2 sm:left-auto sm:right-full sm:mr-2 sm:top-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-105"
              title="Swap locations"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Manual Timezone Fallback */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <svg
              className="w-4 h-4 transition-transform group-open:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced: Select timezone manually
          </summary>
          <div className="mt-4 grid sm:grid-cols-2 gap-4 sm:gap-6 p-4 bg-muted/30 dark:bg-slate-700/30 rounded-lg">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground">From Timezone</label>
              <SearchableSelect
                value={fromTZ}
                onChange={setFromTZ}
                options={timeZoneOptions}
                placeholder="Select timezone..."
                ariaLabel="Select source timezone"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground">To Timezone</label>
              <SearchableSelect
                value={toTZ}
                onChange={setToTZ}
                options={timeZoneOptions}
                placeholder="Select timezone..."
                ariaLabel="Select target timezone"
              />
            </div>
          </div>
        </details>

        {/* Date/Time Input - moved closer to location inputs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground dark:text-slate-200 uppercase tracking-wide">
              Date & Time (in {getFromZoneDisplayName()})
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleNowClick}
                className="px-3 py-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 shadow-sm"
              >
                Current Time
              </button>
              <button
                type="button"
                onClick={handleClearAllClick}
                className="px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-all duration-200 shadow-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="date-input" className="block text-xs text-muted-foreground">
              Date
            </label>
            <div className="relative">
              <input
                id="date-input"
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full px-3 py-3 bg-input dark:bg-slate-700 border-2 border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm font-mono shadow-sm dark:text-slate-100"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="time-input" className="block text-xs text-muted-foreground">
              Time
            </label>
            <InlineTimePicker
              value={inputTime && inputTime.trim() ? `${inputTime.trim()}:00` : "09:00:00"}
              onChange={(timeStr) => {
                // timeStr comes in as "HH:mm:ss" format, extract just "HH:mm"
                const [hour, minute] = timeStr.split(':');
                const formattedTime = `${hour}:${minute}`;
                setInputTime(formattedTime);
              }}
              is24h={!hour12}
              placeholder={hour12 ? "9:00 AM" : "09:00"}
            />
          </div>
        </div>
        
          {(!inputDate || !inputTime) && (
            <p className="text-xs text-muted-foreground dark:text-slate-400 italic">
              Leave empty to use current time
            </p>
          )}

          {/* Calculate Button */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleCalculate}
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              Calculate Time Difference
            </button>
          </div>
        </div>
      </div>

      {/* Conversion Result */}
      {result && (
        <div className="bg-gradient-to-br from-muted/80 to-muted/40 dark:from-slate-700/80 dark:to-slate-700/40 rounded-2xl p-4 sm:p-6 mb-6 border border-border/50 dark:border-slate-600/50 shadow-inner">
          <div className="text-center space-y-6">
            {/* Main Result */}
            <div className="text-lg sm:text-xl font-bold text-foreground dark:text-slate-100">
              <span className="text-primary dark:text-accent">{result.from.time}</span>
              <span className="mx-2 text-muted-foreground">in</span>
              <span className="text-emerald-600 dark:text-emerald-400">{getFromZoneDisplayName()}</span>
              <span className="mx-2 text-muted-foreground">=</span>
              <span className="text-primary dark:text-accent">{result.to.time}</span>
              <span className="mx-2 text-muted-foreground">in</span>
              <span className="text-emerald-600 dark:text-emerald-400">{getToZoneDisplayName()}</span>
            </div>

            {/* Time Difference - Emphasized */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-xl p-4 border border-primary/20 dark:border-primary/30">
              <div className="text-xs text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1">
                Time Difference
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-primary dark:text-accent">
                {getTimeDifference()}
              </div>
            </div>

            {/* Date Information */}
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground dark:text-slate-400">
                <div className="space-y-1">
                  <div className="font-medium text-foreground dark:text-slate-200">
                    {getFromZoneDisplayName()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fromTZ && `${fromTZ} (${getOffsetLabel(fromTZ, result.targetDate)})`}
                  </div>
                  <div>{result.from.weekday}, {result.from.date}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground dark:text-slate-200">
                    {getToZoneDisplayName()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {toTZ && `${toTZ} (${getOffsetLabel(toTZ, result.targetDate)})`}
                  </div>
                  <div>{result.to.weekday}, {result.to.date}</div>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* DST Notice */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground dark:text-slate-400">
          🌍 Handles Daylight Saving Time automatically
        </p>
      </div>

    </div>
  );
}
