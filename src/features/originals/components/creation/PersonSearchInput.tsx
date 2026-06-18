import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, UserPlus, X, User } from "lucide-react";
import { PROFILES_DIRECTORY, ProfileEntry } from "../../../../mock";

export interface CastMember {
  profileId: string;
  actorName: string;
  characterName: string;
  profilePicture?: string;
}

interface PersonSearchInputProps {
  type: "STAR" | "MAKER";
  onSelect: (member: CastMember) => void;
  onCancel: () => void;
  placeholderRole: string;
}

/**
 * PersonSearchInput — Autocomplete search that resolves against the platform's
 * profiles directory. If the person doesn't exist, allows creating a stub entry.
 */
export function PersonSearchInput({
  type,
  onSelect,
  onCancel,
  placeholderRole,
}: PersonSearchInputProps) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileEntry | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus the search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fuzzy search profiles
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PROFILES_DIRECTORY.filter(
      (p) =>
        p.name.toLowerCase().includes(q) &&
        (type === "STAR"
          ? p.profileType === "STAR"
          : p.profileType === "MAKER")
    ).slice(0, 5);
  }, [query, type]);

  // Also search across ALL types as secondary results
  const crossResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PROFILES_DIRECTORY.filter(
      (p) =>
        p.name.toLowerCase().includes(q) &&
        (type === "STAR"
          ? p.profileType !== "STAR"
          : p.profileType !== "MAKER")
    ).slice(0, 3);
  }, [query, type]);

  const allResults = [...results, ...crossResults];
  const hasExactMatch = allResults.some(
    (p) => p.name.toLowerCase() === query.trim().toLowerCase()
  );
  const showDropdown = isFocused && query.trim().length > 0;

  const handleSelectProfile = (profile: ProfileEntry) => {
    setSelectedProfile(profile);
    setQuery(profile.name);
    setIsFocused(false);
  };

  const handleCreateStub = () => {
    const stubProfile: ProfileEntry = {
      id: `stub-${Date.now()}`,
      name: query.trim(),
      profilePicture: undefined,
      tagline: undefined,
      profileType: type,
    };
    setSelectedProfile(stubProfile);
    setIsFocused(false);
  };

  const handleConfirm = () => {
    if (!selectedProfile) return;
    onSelect({
      profileId: selectedProfile.id,
      actorName: selectedProfile.name,
      characterName: role,
      profilePicture: selectedProfile.profilePicture,
    });
  };

  const handleClearSelection = () => {
    setSelectedProfile(null);
    setQuery("");
    setRole("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4"
    >
      {/* Search or Selected State */}
      {selectedProfile ? (
        <div className="flex items-center gap-3">
          {/* Selected Profile Chip */}
          <div className="flex items-center gap-3 flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
              {selectedProfile.profilePicture ? (
                <img loading="lazy"
                  src={selectedProfile.profilePicture}
                  alt={selectedProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white/20" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-tight text-white truncate">
                {selectedProfile.name}
              </span>
              {selectedProfile.tagline ? (
                <span className="text-[8px] font-medium text-white/20 uppercase tracking-widest truncate">
                  {selectedProfile.tagline}
                </span>
              ) : (
                <span className="text-[8px] font-medium text-yellow-500/50 uppercase tracking-widest">
                  New to Platform
                </span>
              )}
            </div>
            <button
              onClick={handleClearSelection}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-auto flex-shrink-0"
            >
              <X className="w-3 h-3 text-white/30" />
            </button>
          </div>

          {/* Role Input */}
          <input
            type="text"
            placeholder={placeholderRole}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium focus:border-white/30 outline-none transition-all placeholder:text-white/10 font-mono"
          />
        </div>
      ) : (
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-3.5 h-3.5 text-white/15 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder={
                type === "STAR"
                  ? "Search star by name..."
                  : "Search maker by name..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-bold focus:border-white/30 outline-none transition-all placeholder:text-white/10 uppercase tracking-widest"
            />
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-white/10 bg-surface-deep backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
              >
                {allResults.length > 0 && (
                  <div className="max-h-[200px] overflow-y-auto no-scrollbar">
                    {allResults.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => handleSelectProfile(profile)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                          {profile.profilePicture ? (
                            <img loading="lazy"
                              src={profile.profilePicture}
                              alt={profile.name}
                              className="w-full h-full object-cover grayscale opacity-60"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white/20" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-tight text-white/80 truncate">
                            {profile.name}
                          </span>
                          <span className="text-[8px] font-medium text-white/20 uppercase tracking-widest truncate">
                            {profile.tagline || profile.profileType}
                          </span>
                        </div>
                        <span className="ml-auto text-[7px] font-bold uppercase tracking-widest text-white/10 flex-shrink-0">
                          {profile.profileType}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Create New — always shown if no exact match */}
                {!hasExactMatch && query.trim() && (
                  <>
                    {allResults.length > 0 && (
                      <div className="h-px bg-white/5" />
                    )}
                    <button
                      onClick={handleCreateStub}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <UserPlus className="w-4 h-4 text-yellow-500/60" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-tight text-yellow-500/80 truncate">
                          Create "{query.trim()}"
                        </span>
                        <span className="text-[8px] font-medium text-white/20 uppercase tracking-widest">
                          Not on Platform yet
                        </span>
                      </div>
                    </button>
                  </>
                )}

                {allResults.length === 0 && hasExactMatch && null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="text-[9px] font-bold uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors px-3 py-2"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedProfile || !role.trim()}
          className="text-[9px] font-black uppercase tracking-widest text-black bg-white px-5 py-2 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/90 transition-all"
        >
          Confirm
        </button>
      </div>
    </motion.div>
  );
}
