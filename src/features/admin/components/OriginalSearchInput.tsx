import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2, Film } from "lucide-react";
import { useSearchQuery, OriginalHit } from "@/lib/search";

interface OriginalSearchInputProps {
  value: string;
  onChange: (id: string, original?: OriginalHit) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  labelColorClass?: string;
}

export function OriginalSearchInput({
  value,
  onChange,
  label = "Target Original *",
  placeholder = "Search Original by title or enter UUID...",
  required = false,
  labelColorClass = "text-amber-300",
}: OriginalSearchInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOriginal, setSelectedOriginal] = useState<OriginalHit | null>(null);
  const [isManualInput, setIsManualInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { results, loading } = useSearchQuery("originals", query);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isValidUuid = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id.trim());

  const handleSelect = (orig: OriginalHit) => {
    setSelectedOriginal(orig);
    onChange(orig.id, orig);
    setIsOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    setSelectedOriginal(null);
    onChange("", undefined);
    setQuery("");
  };

  return (
    <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className={`text-[10px] font-bold uppercase tracking-widest ${labelColorClass}`}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            setIsManualInput(!isManualInput);
            setIsOpen(false);
          }}
          className="text-[9px] font-bold text-white/40 hover:text-white/80 underline tracking-wider uppercase transition-colors"
        >
          {isManualInput ? "Use Live Search" : "Manual UUID Entry"}
        </button>
      </div>

      {/* Mode A: Selected Original Badge/Card */}
      {value && selectedOriginal && !isManualInput ? (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-white">
          <div className="flex items-center gap-3 overflow-hidden">
            {selectedOriginal.coverImg ? (
              <img
                src={selectedOriginal.coverImg}
                alt={selectedOriginal.title}
                className="w-10 h-10 rounded-xl object-cover object-top border border-white/20 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5 text-amber-400" />
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold truncate">{selectedOriginal.title}</span>
              <span className="text-[10px] font-mono text-white/50 truncate">{selectedOriginal.id}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all shrink-0 ml-2"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : isManualInput ? (
        /* Mode B: Direct Manual UUID Input */
        <input
          type="text"
          required={required}
          placeholder="Enter 36-character UUID directly..."
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          className="bg-white/5 border border-amber-500/30 rounded-2xl py-3 px-4 text-xs font-mono font-bold text-white outline-none focus:border-amber-400 transition-all placeholder:text-white/20"
        />
      ) : (
        /* Mode C: Interactive Search Input */
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full bg-white/5 border border-amber-500/30 rounded-2xl py-3 pl-10 pr-10 text-xs font-medium text-white outline-none focus:border-amber-400 transition-all placeholder:text-white/20"
            />
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {loading && <Loader2 className="w-4 h-4 text-amber-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />}
          </div>

          {/* Search Dropdown Overlay */}
          {isOpen && (query.trim().length >= 2 || isValidUuid(query.trim())) && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-zinc-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto no-scrollbar backdrop-blur-xl">
              {results.originals.length > 0 ? (
                <div className="p-1.5 flex flex-col gap-1">
                  <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                    Matching Originals Archive ({results.originals.length})
                  </div>
                  {results.originals.map((orig) => (
                    <button
                      key={orig.id}
                      type="button"
                      onClick={() => handleSelect(orig)}
                      className="w-full p-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3 text-left transition-all group"
                    >
                      {orig.coverImg ? (
                        <img
                          src={orig.coverImg}
                          alt={orig.title}
                          className="w-8 h-8 rounded-lg object-cover object-top border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                          <Film className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                      <div className="flex flex-col flex-1 truncate">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {orig.title}
                        </span>
                        <span className="text-[9px] font-mono text-white/40 truncate">{orig.id}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : !loading ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-white/40">No Originals found for "{query}"</p>
                  {isValidUuid(query.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange(query.trim());
                        setIsOpen(false);
                      }}
                      className="mt-2 text-xs font-bold text-amber-400 hover:underline"
                    >
                      Use raw UUID: {query.trim()}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
