"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Add custom styles for scrollbar hiding
const customStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar { 
    display: none;  /* Safari and Chrome */
  }
`;

interface CustomTimePickerProps {
  field: 'start' | 'end' | 'time';
  is24h: boolean;
  currentTime: string;
  onSelect: (timeStr: string) => void;
  onClose: () => void;
  title?: string;
}

export function CustomTimePicker({ 
  field, 
  is24h, 
  currentTime, 
  onSelect, 
  onClose,
  title = "Select Time"
}: CustomTimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  
  // Refs for wheel event handling with passive: false
  const hourWheelRef = useRef<HTMLDivElement>(null);
  const minuteWheelRef = useRef<HTMLDivElement>(null);
  
  // Throttling refs to prevent rapid scrolling
  const lastWheelTime = useRef<number>(0);
  const wheelThrottle = 300; // ms - increased for less sensitivity
  
  // Wheel accumulation for more natural scrolling
  const wheelDelta = useRef<{ hour: number; minute: number }>({ hour: 0, minute: 0 });
  const wheelThreshold = 50; // Accumulated delta needed to trigger scroll
  const wheelResetTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Touch handling for mobile
  const touchStart = useRef<{ y: number; element: 'hour' | 'minute' | null }>({ y: 0, element: null });
  const lastTouchTime = useRef<number>(0);
  const touchThrottle = 200; // ms - increased for less sensitivity

  // Parse current time on mount
  useEffect(() => {
    if (currentTime && currentTime !== "00:00:00") {
      const parts = currentTime.split(':');
      let hour = parseInt(parts[0], 10);
      let minute = parseInt(parts[1], 10);
      
      // Validate parsed values
      if (isNaN(hour)) hour = 9;
      if (isNaN(minute)) minute = 0;
      
      if (is24h) {
        setSelectedHour(hour);
        setSelectedMinute(minute);
      } else {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        setSelectedHour(displayHour);
        setSelectedMinute(minute);
        setSelectedPeriod(period);
      }
    } else {
      // Set default values when no valid time is provided
      if (is24h) {
        setSelectedHour(9);
        setSelectedMinute(0);
      } else {
        setSelectedHour(9);
        setSelectedMinute(0);
        setSelectedPeriod('AM');
      }
    }
  }, [currentTime, is24h]);

  // Inject custom styles for time picker
  useEffect(() => {
    const styleId = 'custom-time-picker-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = customStyles;
      document.head.appendChild(style);
    }
  }, []);

  // Create base arrays for true infinite scrolling
  const hours = is24h 
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);
  
  const minutes = Array.from({ length: 60 }, (_, i) => i); // 1-minute intervals
  const periods = ['AM', 'PM'];

  // Scroll handlers for infinite looping
  const handleHourScroll = useCallback((direction: 'up' | 'down') => {
    const maxHour = is24h ? 23 : 12;
    const minHour = is24h ? 0 : 1;
    
    let newHour;
    // Note: 'up' means previous/smaller number, 'down' means next/larger number
    if (direction === 'down') { // Arrow pointing down = increase number
      newHour = selectedHour === maxHour ? minHour : selectedHour + 1;
    } else { // Arrow pointing up = decrease number
      newHour = selectedHour === minHour ? maxHour : selectedHour - 1;
    }
    
    setSelectedHour(newHour);
    
    // Immediate smooth scroll without setTimeout
    requestAnimationFrame(() => {
      const hourElement = hourWheelRef.current;
      if (hourElement) {
        const buttonHeight = 44; // px-3 py-2 ≈ 44px height
        const containerHeight = hourElement.clientHeight; // 128px
        const topPadding = 40; // h-10 = 40px
        const centerOffset = (containerHeight - buttonHeight) / 2;
        const targetIndex = hours.indexOf(newHour);
        const maxScrollTop = hourElement.scrollHeight - containerHeight;
        const scrollTop = topPadding + (targetIndex * buttonHeight) - centerOffset;
        
        hourElement.scrollTo({
          top: Math.max(0, Math.min(maxScrollTop, scrollTop)),
          behavior: 'smooth'
        });
      }
    });
  }, [selectedHour, is24h, hours]);

  const handleMinuteScroll = useCallback((direction: 'up' | 'down') => {
    const currentIndex = minutes.indexOf(selectedMinute);
    let newMinute;
    // Note: 'up' means previous/smaller number, 'down' means next/larger number
    if (direction === 'down') { // Arrow pointing down = increase number
      const nextIndex = currentIndex === minutes.length - 1 ? 0 : currentIndex + 1;
      newMinute = minutes[nextIndex];
    } else { // Arrow pointing up = decrease number
      const prevIndex = currentIndex === 0 ? minutes.length - 1 : currentIndex - 1;
      newMinute = minutes[prevIndex];
    }
    
    setSelectedMinute(newMinute);
    
    // Immediate smooth scroll without setTimeout
    requestAnimationFrame(() => {
      const minuteElement = minuteWheelRef.current;
      if (minuteElement) {
        const buttonHeight = 44; // px-3 py-2 ≈ 44px height
        const containerHeight = minuteElement.clientHeight; // 128px
        const topPadding = 40; // h-10 = 40px
        const centerOffset = (containerHeight - buttonHeight) / 2;
        const targetIndex = minutes.indexOf(newMinute);
        const maxScrollTop = minuteElement.scrollHeight - containerHeight;
        const scrollTop = topPadding + (targetIndex * buttonHeight) - centerOffset;
        
        minuteElement.scrollTo({
          top: Math.max(0, Math.min(maxScrollTop, scrollTop)),
          behavior: 'smooth'
        });
      }
    });
  }, [selectedMinute, minutes]);

  // Add wheel and touch event listeners
  useEffect(() => {
    const hourElement = hourWheelRef.current;
    const minuteElement = minuteWheelRef.current;

    const handleHourWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Accumulate wheel delta for more natural scrolling
      wheelDelta.current.hour += e.deltaY;
      
      // Clear any existing reset timer
      if (wheelResetTimer.current) {
        clearTimeout(wheelResetTimer.current);
      }
      
      // Set timer to reset accumulation after user stops scrolling
      wheelResetTimer.current = setTimeout(() => {
        wheelDelta.current.hour = 0;
        wheelDelta.current.minute = 0;
      }, 200);
      
      // Check if we've accumulated enough delta to trigger a scroll
      if (Math.abs(wheelDelta.current.hour) >= wheelThreshold) {
        const now = Date.now();
        if (now - lastWheelTime.current > 50) { // Reduced throttle for accumulated scrolling
          // Wheel down (positive deltaY) = scroll down = increase number = 'down'
          // Wheel up (negative deltaY) = scroll up = decrease number = 'up'
          handleHourScroll(wheelDelta.current.hour > 0 ? 'down' : 'up');
          wheelDelta.current.hour = 0; // Reset accumulation
          lastWheelTime.current = now;
        }
      }
    };

    const handleMinuteWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Accumulate wheel delta for more natural scrolling
      wheelDelta.current.minute += e.deltaY;
      
      // Clear any existing reset timer
      if (wheelResetTimer.current) {
        clearTimeout(wheelResetTimer.current);
      }
      
      // Set timer to reset accumulation after user stops scrolling
      wheelResetTimer.current = setTimeout(() => {
        wheelDelta.current.hour = 0;
        wheelDelta.current.minute = 0;
      }, 200);
      
      // Check if we've accumulated enough delta to trigger a scroll
      if (Math.abs(wheelDelta.current.minute) >= wheelThreshold) {
        const now = Date.now();
        if (now - lastWheelTime.current > 50) { // Reduced throttle for accumulated scrolling
          // Wheel down (positive deltaY) = scroll down = increase number = 'down'
          // Wheel up (negative deltaY) = scroll up = decrease number = 'up'
          handleMinuteScroll(wheelDelta.current.minute > 0 ? 'down' : 'up');
          wheelDelta.current.minute = 0; // Reset accumulation
          lastWheelTime.current = now;
        }
      }
    };

    // Touch event handlers for mobile
    const handleTouchStart = (e: TouchEvent, element: 'hour' | 'minute') => {
      touchStart.current = {
        y: e.touches[0].clientY,
        element: element
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent default scrolling
      
      if (!touchStart.current.element) return;
      
      const now = Date.now();
      if (now - lastTouchTime.current < touchThrottle) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = touchStart.current.y - currentY;
      const threshold = 30; // Increased minimum distance to trigger scroll
      
      if (Math.abs(deltaY) > threshold) {
        const direction = deltaY > 0 ? 'down' : 'up'; // Swipe up = 'down' (increase), swipe down = 'up' (decrease)
        
        if (touchStart.current.element === 'hour') {
          handleHourScroll(direction);
        } else if (touchStart.current.element === 'minute') {
          handleMinuteScroll(direction);
        }
        
        // Reset touch start for next gesture
        touchStart.current.y = currentY;
        lastTouchTime.current = now;
      }
    };

    const handleTouchEnd = () => {
      touchStart.current.element = null;
    };

    // Add wheel event listeners with passive: false
    if (hourElement) {
      hourElement.addEventListener('wheel', handleHourWheel, { passive: false });
      hourElement.addEventListener('touchstart', (e) => handleTouchStart(e, 'hour'), { passive: false });
      hourElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      hourElement.addEventListener('touchend', handleTouchEnd);
    }
    if (minuteElement) {
      minuteElement.addEventListener('wheel', handleMinuteWheel, { passive: false });
      minuteElement.addEventListener('touchstart', (e) => handleTouchStart(e, 'minute'), { passive: false });
      minuteElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      minuteElement.addEventListener('touchend', handleTouchEnd);
    }

    // Cleanup
    return () => {
      if (hourElement) {
        hourElement.removeEventListener('wheel', handleHourWheel);
        hourElement.removeEventListener('touchstart', (e) => handleTouchStart(e, 'hour'));
        hourElement.removeEventListener('touchmove', handleTouchMove);
        hourElement.removeEventListener('touchend', handleTouchEnd);
      }
      if (minuteElement) {
        minuteElement.removeEventListener('wheel', handleMinuteWheel);
        minuteElement.removeEventListener('touchstart', (e) => handleTouchStart(e, 'minute'));
        minuteElement.removeEventListener('touchmove', handleTouchMove);
        minuteElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleHourScroll, handleMinuteScroll]);

  // Initial scroll to selected values when picker opens
  useEffect(() => {
    // Use requestAnimationFrame for better performance than setTimeout
    requestAnimationFrame(() => {
      const buttonHeight = 44;
      
      // Scroll hour to selected value
      const hourElement = hourWheelRef.current;
      if (hourElement) {
        const hourIndex = hours.indexOf(selectedHour);
        if (hourIndex !== -1) {
          const containerHeight = hourElement.clientHeight;
          const topPadding = 40; // h-10 = 40px
          const centerOffset = (containerHeight - buttonHeight) / 2;
          const maxScrollTop = hourElement.scrollHeight - containerHeight;
          const scrollTop = topPadding + (hourIndex * buttonHeight) - centerOffset;
          hourElement.scrollTo({
            top: Math.max(0, Math.min(maxScrollTop, scrollTop)),
            behavior: 'auto'
          });
        }
      }

      // Scroll minute to selected value
      const minuteElement = minuteWheelRef.current;
      if (minuteElement) {
        const minuteIndex = minutes.indexOf(selectedMinute);
        if (minuteIndex !== -1) {
          const containerHeight = minuteElement.clientHeight;
          const topPadding = 40; // h-10 = 40px
          const centerOffset = (containerHeight - buttonHeight) / 2;
          const maxScrollTop = minuteElement.scrollHeight - containerHeight;
          const scrollTop = topPadding + (minuteIndex * buttonHeight) - centerOffset;
          minuteElement.scrollTo({
            top: Math.max(0, Math.min(maxScrollTop, scrollTop)),
            behavior: 'auto'
          });
        }
      }
    });
  }, []); // Only run once when component mounts

  const handleConfirm = () => {
    let timeStr;
    const safeHour = selectedHour ?? 9;
    const safeMinute = selectedMinute ?? 0;
    const safePeriod = selectedPeriod ?? 'AM';
    
    if (is24h) {
      timeStr = `${safeHour.toString().padStart(2, '0')}:${safeMinute.toString().padStart(2, '0')}:00`;
    } else {
      let hour24 = safeHour;
      if (safePeriod === 'AM' && safeHour === 12) hour24 = 0;
      if (safePeriod === 'PM' && safeHour !== 12) hour24 = safeHour + 12;
      timeStr = `${hour24.toString().padStart(2, '0')}:${safeMinute.toString().padStart(2, '0')}:00`;
    }
    onSelect(timeStr);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-border dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Time Picker Wheels */}
        <div className={`flex gap-2 mb-6 ${is24h ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {/* Hour Wheel */}
          <div className="flex-1">
            <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
              Hour
            </div>
            <div className="relative">
              {/* Scroll up arrow - decreases number */}
              <button
                type="button"
                onClick={() => handleHourScroll('up')}
                className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-card via-card to-transparent dark:from-slate-800 dark:via-slate-800 dark:to-transparent h-8 flex items-center justify-center hover:bg-muted/50 transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              
              <div 
                ref={hourWheelRef}
                className="h-32 overflow-y-auto rounded-lg border border-border dark:border-slate-600 bg-muted/30 dark:bg-slate-700/30 scrollbar-hide"
              >
                {/* Top padding to allow first item to be centered */}
                <div className="h-10"></div>
                {hours.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => setSelectedHour(hour)}
                    className={`w-full px-3 py-2 text-center hover:bg-muted dark:hover:bg-slate-600 transition-colors ${
                      selectedHour === hour 
                        ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground font-medium' 
                        : 'text-foreground dark:text-slate-200'
                    }`}
                  >
                    {is24h ? hour.toString().padStart(2, '0') : hour}
                  </button>
                ))}
                {/* Bottom padding to allow last item to be centered */}
                <div className="h-10"></div>
              </div>

              {/* Scroll down arrow - increases number */}
              <button
                type="button"
                onClick={() => handleHourScroll('down')}
                className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-card via-card to-transparent dark:from-slate-800 dark:via-slate-800 dark:to-transparent h-8 flex items-center justify-center hover:bg-muted/50 transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Minute Wheel */}
          <div className="flex-1">
            <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
              Minute
            </div>
            <div className="relative">
              {/* Scroll up arrow - decreases number */}
              <button
                type="button"
                onClick={() => handleMinuteScroll('up')}
                className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-card via-card to-transparent dark:from-slate-800 dark:via-slate-800 dark:to-transparent h-8 flex items-center justify-center hover:bg-muted/50 transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>

              <div 
                ref={minuteWheelRef}
                className="h-32 overflow-y-auto rounded-lg border border-border dark:border-slate-600 bg-muted/30 dark:bg-slate-700/30 scrollbar-hide"
              >
                {/* Top padding to allow first item to be centered */}
                <div className="h-10"></div>
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    onClick={() => setSelectedMinute(minute)}
                    className={`w-full px-3 py-2 text-center hover:bg-muted dark:hover:bg-slate-600 transition-colors ${
                      selectedMinute === minute 
                        ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground font-medium' 
                        : 'text-foreground dark:text-slate-200'
                    }`}
                  >
                    {minute.toString().padStart(2, '0')}
                  </button>
                ))}
                {/* Bottom padding to allow last item to be centered */}
                <div className="h-10"></div>
              </div>

              {/* Scroll down arrow - increases number */}
              <button
                type="button"
                onClick={() => handleMinuteScroll('down')}
                className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-card via-card to-transparent dark:from-slate-800 dark:via-slate-800 dark:to-transparent h-8 flex items-center justify-center hover:bg-muted/50 transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* AM/PM Toggle (12h only) */}
          {!is24h && (
            <div className="flex-1">
              <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
                Period
              </div>
              <div className="h-32 flex flex-col gap-2 justify-center px-1">
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('AM')}
                  className={`px-3 py-3 rounded-lg transition-colors text-sm font-medium ${
                    selectedPeriod === 'AM' 
                      ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground' 
                      : 'bg-muted/30 dark:bg-slate-700/30 text-foreground dark:text-slate-200 hover:bg-muted dark:hover:bg-slate-600'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('PM')}
                  className={`px-3 py-3 rounded-lg transition-colors text-sm font-medium ${
                    selectedPeriod === 'PM' 
                      ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground' 
                      : 'bg-muted/30 dark:bg-slate-700/30 text-foreground dark:text-slate-200 hover:bg-muted dark:hover:bg-slate-600'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="mb-4 text-center">
          <div className="text-sm text-muted-foreground mb-1">Selected Time</div>
          <div className="text-xl font-mono font-bold text-foreground dark:text-slate-100">
            {is24h 
              ? `${(selectedHour ?? 9).toString().padStart(2, '0')}:${(selectedMinute ?? 0).toString().padStart(2, '0')}`
              : `${selectedHour ?? 9}:${(selectedMinute ?? 0).toString().padStart(2, '0')} ${selectedPeriod ?? 'AM'}`
            }
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-muted dark:bg-slate-700 text-foreground dark:text-slate-200 rounded-lg hover:bg-muted/80 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Set Time
          </button>
        </div>
      </div>
    </div>
  );
}
