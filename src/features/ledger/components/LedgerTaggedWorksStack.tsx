import { useState } from "react";
import { motion } from "motion/react";
import type { LedgerTaggedWork } from "../../../mock/ledger";
import { WorkModal } from "../../shared/modals/WorkModal";

export function LedgerTaggedWorksStack({ works }: { works: LedgerTaggedWork[] }) {
  const [selectedWork, setSelectedWork] = useState<LedgerTaggedWork | null>(null);

  if (!works || works.length === 0) return null;

  return (
    <>
      <div className="flex overflow-x-auto gap-4 pb-6 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {works.map((work) => (
          <motion.button
            key={work.id}
            onClick={() => setSelectedWork(work)}
            className="relative rounded-lg overflow-hidden border border-white/20 shadow-xl w-32 h-20 sm:w-40 sm:h-24 flex-shrink-0 cursor-pointer outline-none focus:ring-2 focus:ring-brand-accent/50 bg-black group"
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img 
              src={work.thumbnailUrl} 
              alt={`Inspired by ${work.authorName}`} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
            />
            <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/90 truncate drop-shadow-md">
                {work.authorName}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {selectedWork && (
        <WorkModal 
          item={{
            id: selectedWork.id,
            title: `Inspired by ${selectedWork.authorName}`,
            category: selectedWork.type === 'poster' ? 'Poster' : 'Edit',
            image: selectedWork.thumbnailUrl,
            author: { name: selectedWork.authorName, handle: selectedWork.authorName.toLowerCase(), avatar: "" },
            platform: selectedWork.platform || 'youtube',
            srcId: selectedWork.srcId || "dQw4w9WgXcQ", 
            originalIds: [],
          } as any}
          onClose={() => setSelectedWork(null)}
        />
      )}
    </>
  );
}
