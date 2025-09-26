'use client';
import { useEffect, useRef, useState } from "react";

export type Place = {
  name: string;
  lat: number;
  lon: number;
};

// Fallback cities for when the API is unavailable
const POPULAR_CITIES: Place[] = [
  // Major US Cities
  { name: "New York, NY, USA", lat: 40.7128, lon: -74.0060 },
  { name: "Los Angeles, CA, USA", lat: 34.0522, lon: -118.2437 },
  { name: "Chicago, IL, USA", lat: 41.8781, lon: -87.6298 },
  { name: "San Francisco, CA, USA", lat: 37.7749, lon: -122.4194 },
  { name: "Miami, FL, USA", lat: 25.7617, lon: -80.1918 },
  { name: "Seattle, WA, USA", lat: 47.6062, lon: -122.3321 },
  { name: "Boston, MA, USA", lat: 42.3601, lon: -71.0589 },
  { name: "Las Vegas, NV, USA", lat: 36.1699, lon: -115.1398 },
  { name: "Atlanta, GA, USA", lat: 33.7490, lon: -84.3880 },
  { name: "Denver, CO, USA", lat: 39.7392, lon: -104.9903 },
  
  // European Cities
  { name: "London, England, UK", lat: 51.5074, lon: -0.1278 },
  { name: "Paris, France", lat: 48.8566, lon: 2.3522 },
  { name: "Berlin, Germany", lat: 52.5200, lon: 13.4050 },
  { name: "Madrid, Spain", lat: 40.4168, lon: -3.7038 },
  { name: "Rome, Italy", lat: 41.9028, lon: 12.4964 },
  { name: "Amsterdam, Netherlands", lat: 52.3676, lon: 4.9041 },
  { name: "Zurich, Switzerland", lat: 47.3769, lon: 8.5417 },
  { name: "Vienna, Austria", lat: 48.2082, lon: 16.3738 },
  { name: "Stockholm, Sweden", lat: 59.3293, lon: 18.0686 },
  { name: "Barcelona, Spain", lat: 41.3851, lon: 2.1734 },
  
  // Asian Cities
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Seoul, South Korea", lat: 37.5665, lon: 126.9780 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Bangkok, Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "Mumbai, India", lat: 19.0760, lon: 72.8777 },
  { name: "Delhi, India", lat: 28.7041, lon: 77.1025 },
  { name: "Shanghai, China", lat: 31.2304, lon: 121.4737 },
  { name: "Hong Kong", lat: 22.3193, lon: 114.1694 },
  { name: "Jakarta, Indonesia", lat: -6.2088, lon: 106.8456 },
  { name: "Manila, Philippines", lat: 14.5995, lon: 120.9842 },
  
  // Other Global Cities
  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Melbourne, Australia", lat: -37.8136, lon: 144.9631 },
  { name: "Toronto, ON, Canada", lat: 43.6532, lon: -79.3832 },
  { name: "Vancouver, BC, Canada", lat: 49.2827, lon: -123.1207 },
  { name: "Montreal, QC, Canada", lat: 45.5017, lon: -73.5673 },
  { name: "Calgary, AB, Canada", lat: 51.0447, lon: -114.0719 },
  { name: "Ottawa, ON, Canada", lat: 45.4215, lon: -75.6972 },
  { name: "Halifax, NS, Canada", lat: 44.6488, lon: -63.5752 },
  { name: "Fredericton, NB, Canada", lat: 45.9636, lon: -66.6431 },
  { name: "Winnipeg, MB, Canada", lat: 49.8951, lon: -97.1384 },
  { name: "Quebec City, QC, Canada", lat: 46.8139, lon: -71.2080 },
  { name: "Dubai, UAE", lat: 25.2048, lon: 55.2708 },
  { name: "São Paulo, Brazil", lat: -23.5505, lon: -46.6333 },
  { name: "Mexico City, Mexico", lat: 19.4326, lon: -99.1332 },
  { name: "Moscow, Russia", lat: 55.7558, lon: 37.6176 },
  { name: "Cairo, Egypt", lat: 30.0444, lon: 31.2357 },
  { name: "Cape Town, South Africa", lat: -33.9249, lon: 18.4241 },
];

function getFallbackCities(query: string): Place[] {
  if (!query || query.length < 2) return [];
  
  return POPULAR_CITIES.filter(city =>
    city.name.toLowerCase().includes(query)
  ).slice(0, 8);
}

interface LocationSearchProps {
  placeholder?: string;
  ariaLabel: string;
  onSelect: (place: Place) => void;
  className?: string;
  value?: string; // Allow external control
  id?: string; // Add id prop for accessibility
  name?: string; // Add name prop for form handling
  onInputChange?: (value: string) => void; // Callback for when user types
}

export function LocationSearch({
  placeholder = "Type a city, address, landmark…",
  ariaLabel,
  onSelect,
  className = "",
  value: externalValue,
  id,
  name,
  onInputChange,
}: LocationSearchProps) {
  const [q, setQ] = useState(externalValue || "");
  const [items, setItems] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // control when searches should happen
  const [focused, setFocused] = useState(false);
  const selectedLabelRef = useRef<string>("");        // last selected text

  // abort/guard stale requests
  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);
  
  // Track hydration to prevent SSR mismatches
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
    console.log('LocationSearch component mounted and hydrated');
  }, []);

  // Update internal query when external value changes
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== q) {
      console.log('Syncing external value to internal state:', externalValue);
      setQ(externalValue);
      selectedLabelRef.current = externalValue;
      setItems([]);
      setOpen(false);
      setLoading(false); // Clear any loading state
    }
  }, [externalValue]);

  useEffect(() => {
    console.log('Search effect triggered - focused:', focused, 'query:', q);
    // do not search if not focused or empty query
    if (!focused || !q.trim()) {
      console.log('Search skipped - not focused or empty query');
      setItems([]);
      setOpen(false);
      return;
    }

    const reqId = ++reqIdRef.current;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        // Try API first, fallback to hardcoded cities if API fails
        let results: Place[] = [];
        
        try {
          const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`, {
            signal: ac.signal,
          });
          
          if (res.ok) {
            const data = await res.json();
            results = data?.results ?? [];
            console.log('Geoapify API results for', q, ':', results.length, 'cities found');
          } else {
            console.warn('API request failed, using fallback cities');
            results = getFallbackCities(q.toLowerCase().trim());
          }
        } catch (apiError) {
          console.warn('API request error, using fallback cities:', apiError);
          results = getFallbackCities(q.toLowerCase().trim());
        }
        
        // ignore stale responses
        if (reqId !== reqIdRef.current || ac.signal.aborted) return;

        setItems(results);
        setOpen(focused && results.length > 0);
        console.log('Dropdown open:', focused && results.length > 0, 'with', results.length, 'results');
      } catch (error) {
        if (ac.signal.aborted) return;
        console.warn('Location search failed, using fallback:', error);
        
        const fallbackResults = getFallbackCities(q.toLowerCase().trim());
        if (reqId === reqIdRef.current && !ac.signal.aborted) {
          setItems(fallbackResults);
          setOpen(focused && fallbackResults.length > 0);
        }
      } finally {
        if (reqId === reqIdRef.current && !ac.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [q, focused]);

  // picking a place locks the value and prevents an immediate re-search
  const pick = (p: Place) => {
    selectedLabelRef.current = p.name;
    setQ(p.name);
    setItems([]);
    setOpen(false);
    onSelect(p);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="sr-only" htmlFor={id}>{ariaLabel}</label>
      <input
        id={id}
        name={name}
        aria-label={ariaLabel}
        value={q}
        onChange={(e) => {
          console.log('Input changed:', e.target.value);
          const newValue = e.target.value;
          setQ(newValue);
          onInputChange?.(newValue);
        }}
        onFocus={() => {
          console.log('LocationSearch focused, query:', q);
          setFocused(true);
          setOpen(items.length > 0);
        }}
        onBlur={() => {
          setFocused(false);
          // close a tick later so clicks on options still register
          setTimeout(() => setOpen(false), 100);
        }}
        placeholder={placeholder}
        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-input dark:bg-slate-700 border-2 border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base sm:text-lg shadow-sm text-foreground dark:text-slate-100"
        autoComplete="off"
        style={{ color: 'inherit' }}
      />
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs opacity-70 text-muted-foreground">…</div>
      )}
      {open && items.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 w-full rounded-xl border border-border/50 bg-card dark:bg-slate-800 shadow-lg max-h-60 overflow-y-auto"
        >
          {items.map((p) => (
            <li
              role="option"
              aria-selected={selectedLabelRef.current === p.name}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(p);
              }}
              className="px-3 py-2 cursor-pointer text-sm hover:bg-muted/50 dark:hover:bg-slate-700/50 text-foreground dark:text-slate-200"
              key={`${p.lat},${p.lon}`}
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
