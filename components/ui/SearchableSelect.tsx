/**
 * SearchableSelect component for timezone selection
 * Provides keyboard navigation and filtering functionality
 */

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  ariaLabel,
  className = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get the selected option
  const selectedOption = options.find(option => option.id === value);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    
    const search = searchTerm.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(search) ||
      option.id.toLowerCase().includes(search)
    );
  }, [options, searchTerm]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  // Update input value when selected option changes
  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else {
      setInputValue('');
    }
  }, [selectedOption]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].id);
          setIsOpen(false);
          setSearchTerm('');
          buttonRef.current?.focus();
        }
        break;
      
      case 'Tab':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const handleOptionClick = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm('');
    buttonRef.current?.focus();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-input dark:bg-slate-700 border-2 border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base sm:text-lg text-left shadow-sm dark:text-slate-100 hover:border-primary/50 dark:hover:border-slate-500"
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? 'text-foreground dark:text-slate-100' : 'text-muted-foreground dark:text-slate-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card dark:bg-slate-800 border border-border dark:border-slate-600 rounded-xl shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-border dark:border-slate-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search timezones..."
                className="w-full pl-10 pr-10 py-2 bg-input dark:bg-slate-700 border border-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm dark:text-slate-100"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-60" role="listbox">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                No timezones found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionClick(option.id)}
                  role="option"
                  aria-selected={option.id === value}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-muted dark:hover:bg-slate-700 transition-colors ${
                    option.id === value 
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground font-medium' 
                      : 'text-foreground dark:text-slate-100'
                  } ${
                    index === highlightedIndex 
                      ? 'bg-muted dark:bg-slate-700' 
                      : ''
                  }`}
                >
                  <div className="truncate">
                    {option.label}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
