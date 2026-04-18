import { memo } from "react";
import { TheatreItem } from "../../../types";
import { CategoryIcon } from "../../../components/icons/AppIcons";
import {
  EditWork,
  PosterWork,
  ScriptWork,
  getWorkKind,
} from "../../shared/work";

interface TheatreFeedItemProps {
  item: TheatreItem;
}

/**
 * A masonry-style feed card used in the Home feed and Original walls.
 *
 * Renders differently for Scripts (parchment), Posters (image + overlay),
 * and Edits/Videos (image + centred play button).
 */
export const TheatreFeedItem = memo(function TheatreFeedItem({
  item,
}: TheatreFeedItemProps) {
  const workKind = getWorkKind(item);

  const renderWork = (work: TheatreItem) => {
    switch (workKind) {
      case "script":
        return <ScriptWork item={work} variant="feed" priority="lazy" />;
      case "poster":
        return <PosterWork item={work} variant="feed" priority="lazy" />;
      default:
        return <EditWork item={work} variant="feed" priority="lazy" />;
    }
  };

  return (
    <div
      className="group cursor-pointer break-inside-avoid w-full inline-block mb-6 md:mb-8"
    >
      {/* Media Container */}
      <div
        className={`relative mb-3 overflow-hidden rounded-xl border bg-white/5 ${
          workKind === "poster"
            ? "border-transparent ring-1 ring-white/5 group-hover:border-white/10"
            : "border-white/5"
        }`}
        style={
          workKind === "script"
            ? undefined
            : {
                aspectRatio: item.aspectRatio
                  ? `${item.aspectRatio}`
                  : workKind === "edit"
                    ? "9/16"
                    : "1 / 1",
              }
        }
      >
        {renderWork(item)}
      </div>
    </div>
  );
});
