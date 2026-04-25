import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { mockLedger, LedgerItem } from "../../mock/ledger";
import { LedgerItemCard } from "./components/LedgerItemCard";
import { ArrowLeft } from "lucide-react";

export function LedgerPage() {
  const [ledger, setLedger] = useState<LedgerItem[]>(mockLedger);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const filter = searchParams.get("filter") || "all";

  const handleUpdateItem = (updatedItem: LedgerItem) => {
    setLedger(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const filteredLedger = ledger.filter((item) => {
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
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Ledger
          </h1>
          <p className="text-white/60 text-lg max-w-xl">
            Your cinematic ledger. Track originals, document your expectations, and log your thoughts.
          </p>
        </header>

        {/* Filters */}
        <div className="flex gap-4 mb-12 border-b border-white/10 pb-4">
          <button
            onClick={() => setSearchParams({ filter: "all" })}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              filter === "all" ? "text-white" : "text-white/40 hover:text-white/80"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSearchParams({ filter: "want_to_watch" })}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              filter === "want_to_watch" ? "text-white" : "text-white/40 hover:text-white/80"
            }`}
          >
            Want to Watch
          </button>
          <button
            onClick={() => setSearchParams({ filter: "watched" })}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              filter === "watched" ? "text-white" : "text-white/40 hover:text-white/80"
            }`}
          >
            Watched
          </button>
        </div>

        {/* Grid (Vertical Stack) */}
        <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
          {filteredLedger.map((item) => (
            <LedgerItemCard key={item.id} item={item} onUpdate={handleUpdateItem} />
          ))}
        </div>
      </div>
    </div>
  );
}
