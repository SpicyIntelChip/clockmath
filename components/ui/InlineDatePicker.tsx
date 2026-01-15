"use client";

import { useState, useEffect, useMemo } from "react";
import { format, isToday, isTomorrow, isYesterday, addDays } from "date-fns";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ChevronDown, Calendar as CalendarIcon } from "lucide-react";

interface InlineDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export function InlineDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
}: InlineDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Format the display value
  const displayValue = useMemo(() => {
    if (!value) return placeholder;
    if (isToday(value)) return "Today";
    if (isTomorrow(value)) return "Tomorrow";
    if (isYesterday(value)) return "Yesterday";
    return format(value, "MMM d, yyyy");
  }, [value, placeholder]);

  // Quick date options
  const quickOptions = [
    { label: "Today", date: new Date() },
    { label: "Tomorrow", date: addDays(new Date(), 1) },
    { label: "Yesterday", date: addDays(new Date(), -1) },
  ];

  const handleQuickSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
    setShowCalendar(false);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setIsOpen(false);
      setShowCalendar(false);
    }
  };

  // Reset calendar view when popover closes
  useEffect(() => {
    if (!isOpen) {
      setShowCalendar(false);
    }
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`
            flex items-center justify-between gap-2
            w-full px-4 py-3
            bg-background dark:bg-slate-700
            border border-border dark:border-slate-600
            rounded-xl
            text-left font-medium
            hover:border-primary/50
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            transition-all duration-200
            ${className}
          `}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className={value ? "text-foreground" : "text-muted-foreground"}>
              {displayValue}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {!showCalendar ? (
          <div className="p-2 space-y-1">
            {/* Quick options */}
            {quickOptions.map((option) => {
              const isSelected = value &&
                format(value, "yyyy-MM-dd") === format(option.date, "yyyy-MM-dd");

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleQuickSelect(option.date)}
                  className={`
                    w-full px-3 py-2 text-left rounded-lg text-sm font-medium
                    transition-colors
                    ${isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                    }
                  `}
                >
                  {option.label}
                </button>
              );
            })}

            {/* Divider */}
            <div className="border-t border-border my-2" />

            {/* Pick a date option */}
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="w-full px-3 py-2 text-left rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Pick a date...
            </button>
          </div>
        ) : (
          <div className="p-2">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setShowCalendar(false)}
              className="mb-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              Back
            </button>

            {/* Calendar */}
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              captionLayout="dropdown"
              initialFocus
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
