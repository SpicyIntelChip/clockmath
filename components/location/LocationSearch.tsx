'use client';
import { useEffect, useRef, useState } from "react";

export type Place = {
  name: string;
  lat: number;
  lon: number;
};

interface LocationSearchProps {
  placeholder?: string;
  ariaLabel: string;
  onSelect: (place: Place) => void;
  className?: string;
  value?: string; // Allow external control
}

export function LocationSearch({
  placeholder = "Type a city, address, landmark…",
  ariaLabel,
  onSelect,
  className = "",
  value: externalValue,
}: LocationSearchProps) {
  const [q, setQ] = useState(externalValue || "");
  const [items, setItems] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // control when searches should happen
  const [focused, setFocused] = useState(false);
  const [dirty, setDirty] = useState(false);          // user typed since last selection?
  const selectedLabelRef = useRef<string>("");        // last selected text

  // abort/guard stale requests
  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);

  // Update internal query when external value changes
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== q) {
      setQ(externalValue);
      selectedLabelRef.current = externalValue;
      setDirty(false); // Don't search when value is set externally (swap, geolocation, etc.)
      setItems([]);
      setOpen(false);
      setLoading(false); // Clear any loading state
    }
  }, [externalValue]);

  useEffect(() => {
    // do not search if not focused, not dirty, or empty query
    if (!focused || !dirty || !q.trim()) {
      setItems([]);
      setOpen(false);
      return;
    }

    const id = ++reqIdRef.current;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("bad");
        const data = await res.json();
        // ignore stale responses
        if (id !== reqIdRef.current || ac.signal.aborted) return;

        const results: Place[] = data?.results ?? [];
        setItems(results);
        setOpen(focused && results.length > 0); // only open if still focused
      } catch (_) {
        if (ac.signal.aborted) return;
        setItems([]);
        setOpen(false);
      } finally {
        if (id === reqIdRef.current && !ac.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [q, focused, dirty]);

  // picking a place locks the value and prevents an immediate re-search
  const pick = (p: Place) => {
    selectedLabelRef.current = p.name;
    setQ(p.name);
    setDirty(false);           // ← stop the effect from searching again
    setItems([]);
    setOpen(false);
    onSelect(p);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="sr-only">{ariaLabel}</label>
      <input
        aria-label={ariaLabel}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setDirty(true);             // user is typing → enable search
        }}
        onFocus={() => {
          setFocused(true);
          // only re-open if there are items and user hasn't just selected
          setOpen(dirty && items.length > 0);
        }}
        onBlur={() => {
          setFocused(false);
          // close a tick later so clicks on options still register
          setTimeout(() => setOpen(false), 100);
        }}
        placeholder={placeholder}
        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-input dark:bg-slate-700 border-2 border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base sm:text-lg font-mono shadow-sm dark:text-slate-100"
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs opacity-70 text-muted-foreground">…</div>
      )}
      {open && items.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 w-full rounded-xl border border-border/50 bg-card dark:bg-slate-800 shadow-lg max-h-60 overflow-y-auto"
        >
          {items.map((p, i) => (
            <li
              role="option"
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