import { useNavigate } from "react-router-dom";
import { ThoughtCard } from "../../shared/thoughts/ThoughtCard";
import { ThoughtItem } from "../../../mock/thoughts";

interface DiscussionsZoneProps {
  thoughts: ThoughtItem[];
}

export function DiscussionsZone({ thoughts }: DiscussionsZoneProps) {
  const navigate = useNavigate();

  if (!thoughts.length) return null;

  return (
    <div className="overflow-x-auto no-scrollbar pb-2">
      <div className="flex gap-4 sm:gap-6 w-max px-6 md:px-12">
        {thoughts.map((thought) => (
          <ThoughtCard
            key={thought.id}
            thought={thought}
            onCardClick={() =>
              navigate(`/sets/${thought.setId}/discussions/${thought.id}`)
            }
          />
        ))}
      </div>
    </div>
  );
}
