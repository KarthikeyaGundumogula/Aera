import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "../../../components/SectionHeader";
import { ThoughtCard } from "../../shared/thoughts/ThoughtCard";
import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import type { Thought } from "@/types/thoughts";

export function TrendingDiscussions() {
  const navigate = useNavigate();
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  useEffect(() => {
    apiFetch("/thoughts")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setThoughts(json.items || json.data || []);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="mb-12">
      <SectionHeader
        icon={MessageSquare}
        title="Trending Discussions"
        containerClassName="px-6 md:px-12 mb-6"
      />
      <div className="overflow-x-auto no-scrollbar pb-6 px-6 md:px-12">
        <div className="flex gap-4 sm:gap-6 w-max">
          {thoughts.map((thought: Thought) => (
            <ThoughtCard
              key={thought.id}
              thought={thought}
              onCardClick={() => navigate(`/sets/${thought.setId}/discussions/${thought.id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
