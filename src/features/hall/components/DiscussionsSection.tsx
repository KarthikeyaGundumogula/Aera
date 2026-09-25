import { useNavigate } from "react-router-dom";
import { DiscussionCard } from "../../shared/discussions/DiscussionCard";
import type { Thought as ThoughtItem } from "@/types/thoughts";

interface DiscussionsSectionProps {
  thoughts: ThoughtItem[];
}

export function DiscussionsSection({ thoughts }: DiscussionsSectionProps) {
  const navigate = useNavigate();

  if (!thoughts || !thoughts.length) return null;

  return (
    <div className="overflow-x-auto no-scrollbar pb-4">
      <div className="flex gap-4 sm:gap-6 w-max px-6 md:px-12">
        {thoughts.map((thought) => {
          const targetSetId = thought.setId || (thought as any).set_id;
          return (
            <DiscussionCard
              key={thought.id}
              thought={thought as any}
              onCardClick={() =>
                navigate(
                  targetSetId
                    ? `/sets/${targetSetId}/discussions/${thought.id}`
                    : `/discussions/${thought.id}`
                )
              }
            />
          );
        })}
      </div>
    </div>
  );
}
