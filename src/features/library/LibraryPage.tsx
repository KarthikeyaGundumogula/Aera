import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { mockLibrary, CollectionItem } from "../../mock/library";
import { LibraryItemCard } from "./components/LibraryItemCard";
import { ArrowLeft, Plus } from "lucide-react";

export function LibraryPage() {
  const [collection, setCollection] = useState<CollectionItem[]>(mockLibrary);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const filter = searchParams.get("filter") || "all";

  // Listen for global library updates from the LibraryEntryModal
  useEffect(() => {
    const handleUpdate = () => {
      setCollection([...mockLibrary]);
    };
    window.addEventListener("libraryUpdated", handleUpdate);
    return () => window.removeEventListener("libraryUpdated", handleUpdate);
  }, []);

  const handleUpdateItem = (updatedItem: CollectionItem) => {
    setCollection((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
  };

  const filteredCollection = collection.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 pb-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute -top-12 sm:top-0 sm:-left-16 p-2 text-white/40 hover:text-white transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Library
            </h1>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("openLibraryModal"))
              }
              className={`group flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all flex-shrink-0 bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white`}
            >
              <Plus
                className={`w-4 h-4 transition-transform duration-300 group-hover:rotate-90`}
              />
              <span className="hidden sm:inline">New Entry</span>
            </button>
          </div>
          <p className="text-white/40 text-sm sm:text-base max-w-xl mt-4">
            Your cinematic library. Track originals, document your expectations,
            and log your thoughts.
          </p>
        </header>

        {/* Filters */}
        <div className="flex gap-4 mb-12 border-b border-white/10 pb-4">
          <button
            onClick={() => setSearchParams({ filter: "all" })}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              filter === "all"
                ? "text-white"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSearchParams({ filter: "want_to_watch" })}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              filter === "want_to_watch"
                ? "text-white"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            Want to Watch
          </button>
          <button
            onClick={() => setSearchParams({ filter: "watched" })}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              filter === "watched"
                ? "text-white"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            Watched
          </button>
        </div>

        {/* Grid (Vertical Stack) */}
        <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
          {filteredCollection.map((item) => (
            <LibraryItemCard
              key={item.id}
              item={item}
              onUpdate={handleUpdateItem}
            />
          ))}

          {filteredCollection.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/15 mb-4">
                No entries yet
              </p>
              <button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("openLibraryModal"))
                }
                className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                + Add your first entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
