"use client";

import { useState, useEffect, useCallback } from "react";

interface InlineTimePickerProps {
  value: string;
  onChange: (timeStr: string) => void;
  is24h: boolean;
  placeholder?: string;
  className?: string;
}

export function InlineTimePicker({ 
  value, 
  onChange, 
  is24h, 
  placeholder = "Select time",
  className = ""
}: InlineTimePickerProps) {
  // Debug version - check console for input handling
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [timeInput, setTimeInput] = useState('');
  const [isInputMode, setIsInputMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Parse current time on mount or when value changes
  useEffect(() => {
    if (value) {
      const [timePart] = value.split(':');
      const hour = parseInt(timePart, 10);
      const minute = parseInt(value.split(':')[1] || '0', 10);
      
      if (!isNaN(hour) && !isNaN(minute)) {
        if (is24h) {
          // Store in 24h format
          setSelectedHour(hour);
          setSelectedMinute(minute);
          setTimeInput(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
          setHourFormat('24h');
        } else {
          // Convert incoming 24h to 12h format
          let hour12 = hour;
          let period: 'AM' | 'PM' = 'AM';
          
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
          setSelectedMinute(minute);
          setSelectedPeriod(period);
          setTimeInput(`${hour12}:${minute.toString().padStart(2, '0')} ${period}`);
          setHourFormat('12h');
        }
      }
    } else {
      setTimeInput('');
    }
  }, [value, is24h]);

  const formatDisplayTime = useCallback(() => {
    // selectedHour is always in the correct format now (12h when !is24h, 24h when is24h)
    if (is24h) {
      return `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    } else {
      return `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
    }
  }, [selectedHour, selectedMinute, selectedPeriod, is24h]);

  // Track the current format of selectedHour to prevent double conversion
  const [hourFormat, setHourFormat] = useState<'12h' | '24h'>('12h');
  
  // Handle format switching - convert hour between 12h and 24h
  useEffect(() => {
    const targetFormat = is24h ? '24h' : '12h';
    if (hourFormat === targetFormat) return; // No conversion needed
    
    if (targetFormat === '24h' && hourFormat === '12h') {
      // Converting from 12h to 24h
      let hour24 = selectedHour;
      if (selectedPeriod === 'AM' && selectedHour === 12) {
        hour24 = 0;
      } else if (selectedPeriod === 'PM' && selectedHour !== 12) {
        hour24 = selectedHour + 12;
      }
      setSelectedHour(hour24);
      setHourFormat('24h');
    } else if (targetFormat === '12h' && hourFormat === '24h') {
      // Converting from 24h to 12h
      let hour12 = selectedHour;
      let period: 'AM' | 'PM' = 'AM';
      
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
      setSelectedPeriod(period);
      setHourFormat('12h');
    }
  }, [is24h, hourFormat, selectedHour, selectedPeriod]);
  
  // Update time input display when hour/minute/period changes
  useEffect(() => {
    if (selectedHour !== undefined && selectedMinute !== undefined) {
      if (is24h) {
        setTimeInput(`${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`);
      } else {
        setTimeInput(`${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`);
      }
    }
  }, [is24h, selectedHour, selectedMinute, selectedPeriod]);


  // Parse time input and update state (called on blur or confirm)
  const parseAndApplyTimeInput = useCallback((input: string) => {
    if (!input || input.trim() === '') return;
    
    const cleaned = input.trim().toUpperCase();
    
    // Check for AM/PM in 12h mode
    let period = selectedPeriod;
    if (!is24h) {
      if (cleaned.includes('P')) period = 'PM';
      if (cleaned.includes('A')) period = 'AM';
    }
    
    // Extract just the numbers and colon
    const digits = cleaned.replace(/[^\d:]/g, '');
    
    let hour: number | null = null;
    let minute: number | null = null;
    
    if (digits.includes(':')) {
      // Format: "9:30" or "09:30"
      const parts = digits.split(':');
      hour = parseInt(parts[0], 10);
      minute = parseInt(parts[1], 10);
    } else {
      // Format: "930" or "0930" or "1230"
      if (digits.length === 1 || digits.length === 2) {
        // "9" or "09" → hour only
        hour = parseInt(digits, 10);
        minute = 0;
      } else if (digits.length === 3) {
        // "930" → 9:30
        hour = parseInt(digits.slice(0, 1), 10);
        minute = parseInt(digits.slice(1, 3), 10);
      } else if (digits.length === 4) {
        // "0930" or "1230" → 09:30 or 12:30
        hour = parseInt(digits.slice(0, 2), 10);
        minute = parseInt(digits.slice(2, 4), 10);
      }
    }
    
    // Validate and apply
    if (hour !== null && minute !== null && !isNaN(hour) && !isNaN(minute) && minute >= 0 && minute <= 59) {
      if (is24h) {
        if (hour >= 0 && hour <= 23) {
          setSelectedHour(hour);
          setSelectedMinute(minute);
          setHourFormat('24h');
        }
      } else {
        // 12h format
        if (hour >= 1 && hour <= 12) {
          setSelectedHour(hour);
          setSelectedMinute(minute);
          setSelectedPeriod(period);
          setHourFormat('12h');
        } else if (hour >= 13 && hour <= 23) {
          // User typed 24h format in 12h mode - convert it
          setSelectedHour(hour > 12 ? hour - 12 : hour);
          setSelectedMinute(minute);
          setSelectedPeriod('PM');
          setHourFormat('12h');
        } else if (hour === 0) {
          // Midnight
          setSelectedHour(12);
          setSelectedMinute(minute);
          setSelectedPeriod('AM');
          setHourFormat('12h');
        }
      }
    }
  }, [is24h, selectedPeriod]);
  
  // Handle time input - just update the display, don't parse until blur/confirm
  const handleTimeInputChange = useCallback((inputValue: string) => {
    // Allow colons, digits, spaces, and AM/PM for 12h format
    let cleanValue = inputValue;
    
    if (is24h) {
      // 24h: only digits and colons, max 5 chars (HH:MM)
      cleanValue = inputValue.replace(/[^\d:]/g, '').slice(0, 5);
    } else {
      // 12h: allow digits, colons, spaces, A, P, M
      cleanValue = inputValue.replace(/[^\d:\sAPMapm]/g, '').slice(0, 8);
    }
    
    // Just update the display, don't parse yet
    setTimeInput(cleanValue);
  }, [is24h]);

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
    let hour24: number;
    let minute: number;
    
    // If user typed something, parse it directly (don't rely on state updates)
    if (timeInput && timeInput.trim()) {
      const cleaned = timeInput.trim().toUpperCase();
      
      // Check for AM/PM in 12h mode
      let period = selectedPeriod;
      if (!is24h) {
        if (cleaned.includes('P')) period = 'PM';
        if (cleaned.includes('A')) period = 'AM';
      }
      
      // Extract just the numbers and colon
      const digits = cleaned.replace(/[^\d:]/g, '');
      
      let parsedHour: number | null = null;
      let parsedMinute: number | null = null;
      
      if (digits.includes(':')) {
        // Format: "9:30" or "09:30"
        const parts = digits.split(':');
        parsedHour = parseInt(parts[0], 10);
        parsedMinute = parseInt(parts[1], 10);
      } else {
        // Format: "930" or "0930" or "1230"
        if (digits.length === 1 || digits.length === 2) {
          // "9" or "09" → hour only
          parsedHour = parseInt(digits, 10);
          parsedMinute = 0;
        } else if (digits.length === 3) {
          // "930" → 9:30
          parsedHour = parseInt(digits.slice(0, 1), 10);
          parsedMinute = parseInt(digits.slice(1, 3), 10);
        } else if (digits.length === 4) {
          // "0930" or "1230" → 09:30 or 12:30
          parsedHour = parseInt(digits.slice(0, 2), 10);
          parsedMinute = parseInt(digits.slice(2, 4), 10);
        }
      }
      
      // Validate and convert to 24h
      if (parsedHour !== null && parsedMinute !== null && !isNaN(parsedHour) && !isNaN(parsedMinute) && parsedMinute >= 0 && parsedMinute <= 59) {
        if (is24h) {
          if (parsedHour >= 0 && parsedHour <= 23) {
            hour24 = parsedHour;
            minute = parsedMinute;
          } else {
            // Invalid, use current state
            hour24 = selectedHour;
            minute = selectedMinute;
          }
        } else {
          // 12h format - convert to 24h
          minute = parsedMinute;
          if (parsedHour >= 1 && parsedHour <= 12) {
            if (period === 'AM' && parsedHour === 12) {
              hour24 = 0;
            } else if (period === 'PM' && parsedHour !== 12) {
              hour24 = parsedHour + 12;
            } else {
              hour24 = parsedHour;
            }
          } else if (parsedHour >= 13 && parsedHour <= 23) {
            // User typed 24h format in 12h mode
            hour24 = parsedHour;
            minute = parsedMinute;
          } else if (parsedHour === 0) {
            // Midnight
            hour24 = 0;
            minute = parsedMinute;
          } else {
            // Invalid, use current state
            hour24 = selectedHour;
            minute = selectedMinute;
            if (!is24h) {
              if (selectedPeriod === 'AM' && selectedHour === 12) {
                hour24 = 0;
              } else if (selectedPeriod === 'PM' && selectedHour !== 12) {
                hour24 = selectedHour + 12;
              }
            }
          }
        }
      } else {
        // Parsing failed, use current state
        hour24 = selectedHour;
        minute = selectedMinute;
        if (!is24h) {
          if (selectedPeriod === 'AM' && selectedHour === 12) {
            hour24 = 0;
          } else if (selectedPeriod === 'PM' && selectedHour !== 12) {
            hour24 = selectedHour + 12;
          }
        }
      }
    } else {
      // No typed input, use selected values from controls
      hour24 = selectedHour;
      minute = selectedMinute;
      
      if (!is24h) {
        // Convert 12h to 24h
        if (selectedPeriod === 'AM' && selectedHour === 12) {
          hour24 = 0;
        } else if (selectedPeriod === 'PM' && selectedHour !== 12) {
          hour24 = selectedHour + 12;
        }
      }
    }
    
    const timeStr = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    onChange(timeStr);
    setIsOpen(false);
  }, [selectedHour, selectedMinute, selectedPeriod, is24h, timeInput, onChange]);

  return (
    <div className={`relative ${className}`}>
      {/* Time Input Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // If opening, focus the input and select text
          if (!isOpen) {
            setTimeout(() => {
              const input = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (input) {
                input.focus();
                input.select();
              }
            }, 100);
          }
        }}
        className={`w-full px-4 py-3 text-left bg-background dark:bg-slate-700 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 border-border dark:border-slate-600 hover:border-primary/50`}
      >
        <div className="flex items-center justify-between">
          <span className="text-foreground dark:text-slate-100 font-mono">
            {timeInput || formatDisplayTime()}
          </span>
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Time Picker */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl shadow-xl z-[100] p-4 mb-4">
          {/* Time Display */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-foreground dark:text-slate-100 font-mono">
              <input
                type="text"
                value={timeInput || formatDisplayTime()}
                onChange={(e) => {
                  setIsInputMode(true);
                  handleTimeInputChange(e.target.value);
                }}
                onFocus={(e) => {
                  setIsInputMode(true);
                  // Show current formatted time for editing
                  if (!timeInput || timeInput === formatDisplayTime()) {
                    // Extract just the time part without AM/PM for easier editing
                    const current = formatDisplayTime();
                    const justTime = is24h ? current : current.replace(/\s*(AM|PM)\s*$/i, '');
                    setTimeInput(justTime);
                  }
                  // Select all text when focused
                  setTimeout(() => e.target.select(), 0);
                }}
                onBlur={() => {
                  setIsInputMode(false);
                  // Parse the input and update internal state
                  if (timeInput) {
                    parseAndApplyTimeInput(timeInput);
                    // Auto-confirm when blurring (user clicked away)
                    setTimeout(() => {
                      if (isOpen) {
                        handleConfirm();
                      }
                    }, 100);
                  }
                  // Format the display to show properly formatted time
                  setTimeInput(formatDisplayTime());
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirm();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setIsOpen(false);
                  }
                }}
                className="w-full text-center bg-transparent border-none outline-none focus:bg-muted/20 dark:focus:bg-slate-700/50 rounded-lg px-2 py-1"
                placeholder={is24h ? "09:00" : "9:00 AM"}
                maxLength={is24h ? 5 : 8}
                autoFocus
              />
            </div>
            {!is24h && (
              <div className="flex justify-center mt-2">
                <div className="flex bg-muted/50 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedPeriod('AM')}
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
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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

          {/* Time Controls */}
          <div className="space-y-4">
            {/* Hours */}
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-12">Hour</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleHourChange(-1)}
                  className="w-8 h-8 rounded-lg bg-muted/50 dark:bg-slate-700 hover:bg-muted dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="w-12 text-center">
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
                    className="w-full text-lg font-bold text-center bg-transparent border-none outline-none text-foreground dark:text-slate-100"
                    min={is24h ? 0 : 1}
                    max={is24h ? 23 : 12}
                    step={1}
                  />
                </div>
                <button
                  onClick={() => handleHourChange(1)}
                  className="w-8 h-8 rounded-lg bg-muted/50 dark:bg-slate-700 hover:bg-muted dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="w-8 h-8 rounded-lg bg-muted/50 dark:bg-slate-700 hover:bg-muted dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="w-12 text-center">
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
                    className="w-full text-lg font-bold text-center bg-transparent border-none outline-none text-foreground dark:text-slate-100"
                    min={0}
                    max={59}
                    step={1}
                  />
                </div>
                <button
                  onClick={() => handleMinuteChange(1)}
                  className="w-8 h-8 rounded-lg bg-muted/50 dark:bg-slate-700 hover:bg-muted dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted dark:bg-slate-700/50 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
