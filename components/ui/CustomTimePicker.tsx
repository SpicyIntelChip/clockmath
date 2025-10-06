"use client";

import { useState, useEffect, useCallback } from "react";

interface CustomTimePickerProps {
  field: 'start' | 'end' | 'time';
  is24h: boolean;
  currentTime: string;
  onSelect: (timeStr: string) => void;
  onClose: () => void;
  onFormatChange?: (is24h: boolean) => void;
  title?: string;
}

export function CustomTimePicker({ 
  field, 
  is24h, 
  currentTime, 
  onSelect, 
  onClose,
  onFormatChange,
  title = "Select Time"
}: CustomTimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [timeInput, setTimeInput] = useState('');
  const [isInputMode, setIsInputMode] = useState(false);

  // Parse current time on mount
  useEffect(() => {
    if (currentTime) {
      const [timePart] = currentTime.split(':');
      const hour = parseInt(timePart, 10);
      const minute = parseInt(currentTime.split(':')[1] || '0', 10);
      
      if (!isNaN(hour) && !isNaN(minute)) {
        if (is24h) {
          setSelectedHour(hour);
          setTimeInput(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        } else {
          // Convert 24h to 12h
          let hour12 = hour;
          let period = 'AM';
          
          if (hour === 0) {
            hour12 = 12;
            period = 'AM';
          } else if (hour < 12) {
            hour12 = hour;
            period = 'AM';
          } else if (hour === 12) {
            hour12 = 12;
            period = 'PM';
          } else {
            hour12 = hour - 12;
            period = 'PM';
          }
          
          setSelectedHour(hour12);
          setSelectedPeriod(period as 'AM' | 'PM');
          setTimeInput(`${hour12}:${minute.toString().padStart(2, '0')} ${period}`);
        }
        setSelectedMinute(minute);
      }
    } else {
      // No current time, initialize with default
      setTimeInput('');
    }
    setIsInputMode(true);
  }, [currentTime, is24h]);

  // Auto-focus the input when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select(); // Select all text for easy replacement
      }
    }, 100); // Small delay to ensure modal is fully rendered

    return () => clearTimeout(timer);
  }, []);

  // Auto-format time input (e.g., "1230" -> "12:30")
  const handleTimeInputChange = useCallback((value: string) => {
    // Allow colons and digits
    const cleanValue = value.replace(/[^\d:]/g, '');
    
    // Handle different input patterns
    if (cleanValue.includes(':')) {
      // User typed a colon, respect their input
      const parts = cleanValue.split(':');
      if (parts.length === 2) {
        const hour = parseInt(parts[0], 10);
        const minute = parseInt(parts[1], 10);
        
        if (!isNaN(hour) && !isNaN(minute)) {
          if (is24h) {
            if (hour >= 0 && hour <= 23) {
              setSelectedHour(hour);
            }
          } else {
            if (hour >= 1 && hour <= 12) {
              setSelectedHour(hour);
            } else if (hour > 12 && hour <= 23) {
              setSelectedHour(hour - 12);
              setSelectedPeriod('PM');
            }
          }
          
          if (minute >= 0 && minute <= 59) {
            setSelectedMinute(minute);
          }
        }
      }
      setTimeInput(cleanValue);
    } else {
      // No colon, auto-format based on length
      const digits = cleanValue;
      
      if (digits.length <= 4) {
        setTimeInput(digits);
        
        if (digits.length >= 2) {
          let hour, minute;
          
          if (digits.length === 3) {
            // Handle "100" -> "1:00" case
            hour = parseInt(digits.slice(0, 1), 10);
            minute = parseInt(digits.slice(1, 3), 10);
          } else {
            hour = parseInt(digits.slice(0, 2), 10);
            minute = parseInt(digits.slice(2, 4) || '0', 10);
          }
          
          // Update the display without switching format yet
          if (is24h) {
            if (hour >= 0 && hour <= 23) {
              setSelectedHour(hour);
            }
          } else {
            if (hour >= 1 && hour <= 12) {
              setSelectedHour(hour);
            } else if (hour > 12 && hour <= 23) {
              setSelectedHour(hour - 12);
              setSelectedPeriod('PM');
            }
          }
          
          if (minute >= 0 && minute <= 59) {
            setSelectedMinute(minute);
          }
        }
      }
    }
  }, [is24h]);

  // Format time input with colon
  const formatTimeInput = useCallback((input: string) => {
    const digits = input.replace(/\D/g, '');
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }
    return input;
  }, []);

  const handleHourChange = useCallback((delta: number) => {
    if (is24h) {
      setSelectedHour(prev => {
        const newHour = prev + delta;
        if (newHour < 0) return 23;
        if (newHour > 23) return 0;
        return newHour;
      });
    } else {
      setSelectedHour(prev => {
        const newHour = prev + delta;
        if (newHour < 1) return 12;
        if (newHour > 12) return 1;
        return newHour;
      });
    }
  }, [is24h]);

  const handleMinuteChange = useCallback((delta: number) => {
    setSelectedMinute(prev => {
      const newMinute = prev + delta;
      if (newMinute < 0) return 59;
      if (newMinute > 59) return 0;
      return newMinute;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    // Check if user typed a 24-hour format time (13-23) while in 12h mode
    if (!is24h && onFormatChange) {
      const digits = timeInput.replace(/\D/g, '');
      if (digits.length >= 2) {
        const hour = parseInt(digits.slice(0, 2), 10);
        if (hour >= 13 && hour <= 23) {
          // User typed 24-hour format, switch to 24h mode
          onFormatChange(true);
          // Use the 24-hour time directly
          const minute = parseInt(digits.slice(2, 4) || '0', 10);
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
          onSelect(timeStr);
          return;
        }
      }
    }
    
    let hour24 = selectedHour;
    
    if (!is24h) {
      // Convert 12h to 24h
      if (selectedPeriod === 'AM' && selectedHour === 12) {
        hour24 = 0;
      } else if (selectedPeriod === 'PM' && selectedHour !== 12) {
        hour24 = selectedHour + 12;
      }
    }
    
    const timeStr = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}:00`;
    onSelect(timeStr);
  }, [selectedHour, selectedMinute, selectedPeriod, is24h, timeInput, onSelect, onFormatChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleConfirm, onClose]);

  const formatDisplayTime = useCallback(() => {
    if (is24h) {
      return `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    } else {
      return `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
    }
  }, [selectedHour, selectedMinute, selectedPeriod, is24h]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background dark:bg-slate-800 rounded-2xl shadow-2xl border border-border dark:border-slate-700 w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border dark:border-slate-700">
          <h3 className="text-lg font-semibold text-foreground dark:text-slate-100">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            {/* Time Format Toggle */}
            <div className="bg-muted/50 dark:bg-slate-700/50 rounded-lg p-1 flex items-center gap-1">
              <button
                onClick={() => {
                  if (is24h) {
                    // Converting from 24h to 12h
                    let hour12 = selectedHour;
                    let period = 'AM';
                    
                    if (selectedHour === 0) {
                      hour12 = 12;
                      period = 'AM';
                    } else if (selectedHour < 12) {
                      hour12 = selectedHour;
                      period = 'AM';
                    } else if (selectedHour === 12) {
                      hour12 = 12;
                      period = 'PM';
                    } else {
                      hour12 = selectedHour - 12;
                      period = 'PM';
                    }
                    
                    setSelectedHour(hour12);
                    setSelectedPeriod(period as 'AM' | 'PM');
                    setTimeInput(`${hour12}:${selectedMinute.toString().padStart(2, '0')} ${period}`);
                  }
                  
                  onFormatChange?.(false);
                  // Focus the input after format change
                  setTimeout(() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input) {
                      input.focus();
                      input.select();
                    }
                  }, 50);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  !is24h
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                12h
              </button>
              <button
                onClick={() => {
                  if (!is24h) {
                    // Converting from 12h to 24h
                    let hour24 = selectedHour;
                    
                    if (selectedPeriod === 'AM' && selectedHour === 12) {
                      hour24 = 0;
                    } else if (selectedPeriod === 'PM' && selectedHour !== 12) {
                      hour24 = selectedHour + 12;
                    }
                    
                    setSelectedHour(hour24);
                    setTimeInput(`${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`);
                  }
                  
                  onFormatChange?.(true);
                  // Focus the input after format change
                  setTimeout(() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input) {
                      input.focus();
                      input.select();
                    }
                  }, 50);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  is24h
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                24h
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted/50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Time Display */}
        <div className="p-6 text-center">
          <div className="text-4xl font-bold text-foreground dark:text-slate-100 font-mono mb-6">
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                value={isInputMode ? timeInput : formatDisplayTime()}
                onChange={(e) => {
                  setIsInputMode(true);
                  handleTimeInputChange(e.target.value);
                }}
                onFocus={() => {
                  setIsInputMode(true);
                  if (!timeInput) {
                    setTimeInput('');
                  }
                }}
                onBlur={() => {
                  setIsInputMode(false);
                  setTimeInput(formatDisplayTime());
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    handleHourChange(1);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    handleHourChange(-1);
                  } else if (e.key === 'Tab' && !e.shiftKey) {
                    e.preventDefault();
                    document.querySelector('button[data-confirm]')?.focus();
                  }
                }}
                className="w-36 text-center bg-transparent border-none outline-none focus:bg-muted/20 dark:focus:bg-slate-700/50 rounded-lg px-4 py-2"
                placeholder={is24h ? "09:00" : "9:00 AM"}
                maxLength={is24h ? 6 : 9}
                autoFocus
              />
              {!is24h && (
                <div className="flex bg-muted/50 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedPeriod('AM')}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' && e.shiftKey) {
                        e.preventDefault();
                        document.querySelector('input[type="text"]')?.focus();
                      }
                    }}
                    data-period-input
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === 'AM'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('PM')}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' && !e.shiftKey) {
                        e.preventDefault();
                        document.querySelector('button[data-confirm]')?.focus();
                      }
                    }}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === 'PM'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    PM
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Time Controls */}
          <div className="space-y-6">
            {/* Hours */}
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-12">Hour</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleHourChange(-1)}
                  className="w-10 h-10 rounded-lg bg-muted/50 dark:bg-slate-700 hover:bg-muted dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="w-16 text-center">
                  <input
                    type="number"
                    value={selectedHour}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value)) {
                        if (is24h) {
                          if (value >= 0 && value <= 23) {
                            setSelectedHour(value);
                          } else if (value > 23) {
                            setSelectedHour(23);
                          } else if (value < 0) {
                            setSelectedHour(0);
                          }
                        } else {
                          if (value >= 1 && value <= 12) {
                            setSelectedHour(value);
                          } else if (value > 12) {
                            setSelectedHour(12);
                          } else if (value < 1) {
                            setSelectedHour(1);
                          }
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        handleHourChange(1);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        handleHourChange(-1);
                      }
                    }}
                    className="w-full text-2xl font-bold text-center bg-transparent border-none outline-none text-foreground dark:text-slate-100 focus:bg-muted/20 dark:focus:bg-slate-700/50 rounded-lg px-2 py-1"
                    min={is24h ? 0 : 1}
                    max={is24h ? 23 : 12}
                    step={1}
                  />
                </div>
                <button
                  onClick={() => handleHourChange(1)}
                  className="w-10 h-10 rounded-lg bg-muted/50 dark:bg-slate-700 hover:bg-muted dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Minutes */}
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-12">Min</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMinuteChange(-1)}
                  className="w-10 h-10 rounded-lg bg-muted/50 dark:bg-slate-700 hover:bg-muted dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="w-16 text-center">
                  <input
                    type="number"
                    value={selectedMinute}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value)) {
                        if (value >= 0 && value <= 59) {
                          setSelectedMinute(value);
                        } else if (value > 59) {
                          setSelectedMinute(59);
                        } else if (value < 0) {
                          setSelectedMinute(0);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        handleMinuteChange(1);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        handleMinuteChange(-1);
                      }
                    }}
                    className="w-full text-2xl font-bold text-center bg-transparent border-none outline-none text-foreground dark:text-slate-100 focus:bg-muted/20 dark:focus:bg-slate-700/50 rounded-lg px-2 py-1"
                    min={0}
                    max={59}
                    step={1}
                  />
                </div>
                <button
                  onClick={() => handleMinuteChange(1)}
                  className="w-10 h-10 rounded-lg bg-muted/50 dark:bg-slate-700 hover:bg-muted dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* AM/PM for 12h format */}
            {!is24h && (
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm font-medium text-muted-foreground w-12">Period</span>
                <div className="flex bg-muted/50 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedPeriod('AM')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === 'AM'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('PM')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === 'PM'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border dark:border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted dark:bg-slate-700/50 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            data-confirm
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}