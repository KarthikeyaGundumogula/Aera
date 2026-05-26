import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "../../../components/SectionHeader";
import { THOUGHTS_MOCK } from "../../../mock";
import { ThoughtCard } from "../../shared/thoughts/ThoughtCard";

export function TrendingSequences() {
  const navigate = useNavigate();
  return (
    <section className="mb-12">
      <SectionHeader
        icon={MessageSquare}
        title="Trending Discussions"
        containerClassName="px-6 md:px-12 mb-6"
      />
      <div className="overflow-x-auto no-scrollbar pb-6 px-6 md:px-12">
        <div className="flex gap-4 sm:gap-6 w-max">
          {THOUGHTS_MOCK.map((thought) => (
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
