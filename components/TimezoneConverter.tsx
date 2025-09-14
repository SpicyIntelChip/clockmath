/**
 * TimezoneConverter component for ClockMath.com
 * Main timezone conversion interface with live updates
 */


'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { LocationTimezonePicker } from '@/components/location/LocationTimezonePicker';
  import { 
    getUserTimeZone, 
    getTimeZoneOptions, 
    formatZoned, 
    convertDateBetweenZones,
    parseDateTimeInZone,
    getTimezoneOffset,
    getOffsetLabel
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

  const timeZoneOptions = useMemo(() => getTimeZoneOptions(), []);

  const displayForTZ = useCallback((tz: string) => {
    const opt = timeZoneOptions.find(o => o.id === tz);
    return opt ? opt.label.split(' (')[0] : (tz?.split('/').pop()?.replace(/_/g, ' ') || tz);
  }, [timeZoneOptions]);

  // Initialize with user's timezone
  useEffect(() => {
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
  }, []);

  // Save hour12 preference
  useEffect(() => {
    if (typeof hour12 === 'boolean') {
      localStorage.setItem('clockmath-hour12', hour12.toString());
    }
  }, [hour12]);

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
    } catch (error) {
      console.error('Error converting timezone:', error);
      setResult(null);
    }
  }, [hour12]);

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
      } catch (e) {
        // Fallback: recompute with existing inputs
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
        } catch (error) {
          console.error('Error processing location:', error);
          toast({
            title: 'Location error',
            description: 'Error processing your location.',
            variant: 'destructive',
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
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
        <div className="flex gap-2">
          <button
            onClick={() => setHour12(!hour12)}
            className="px-3 sm:px-4 py-2 text-sm font-medium bg-gradient-to-r from-secondary to-secondary/80 dark:from-slate-700 dark:to-slate-600 text-secondary-foreground dark:text-slate-200 rounded-xl hover:from-secondary/80 hover:to-secondary dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-200 shadow-sm shrink-0"
          >
            {hour12 ? '12h' : '24h'} format
          </button>
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
              defaultHint={`Auto-detected: ${getUserTimeZone()}`}
              value={fromLocationDisplay}
              preset={fromPreset}
              timeZone={fromTZ}
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
              defaultHint="Search for a city..."
              value={toLocationDisplay}
              preset={toPreset}
              timeZone={toTZ}
            />
            
            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapTimezones}
              className="absolute -left-4 top-8 transform -translate-x-full sm:translate-x-0 sm:left-auto sm:right-full sm:mr-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-105"
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
            <div className="relative">
              <input
                id="time-input"
                type="time"
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
                className="w-full px-3 py-3 bg-input dark:bg-slate-700 border-2 border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm font-mono shadow-sm dark:text-slate-100"
              />
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
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
              className="px-8 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
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
