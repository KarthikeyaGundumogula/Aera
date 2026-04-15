import { memo } from "react";
import { TheatreItem, SetSelectedItem } from "../../../types";
import { CategoryIcon } from "../../../components/icons/AppIcons";
import {
  EditWork,
  PosterWork,
  ScriptWork,
  getWorkKind,
} from "../../shared/work";

interface TheatreFeedItemProps {
  item: TheatreItem;
  items: TheatreItem[];
  setSelectedItem: SetSelectedItem;
}

/**
 * A masonry-style feed card used in the Home feed and Original walls.
 *
 * Renders differently for Scripts (parchment), Posters (image + overlay),
 * and Edits/Videos (image + centred play button).
 */
export const TheatreFeedItem = memo(function TheatreFeedItem({
  item,
  items,
  setSelectedItem,
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
      onClick={() => setSelectedItem(item, items, 0)}
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

      {/* Title Footer */}
      <div className="px-1 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <CategoryIcon category={item.category} className="w-3.5 h-3.5 fill-white/20" />
            <h5 className="text-sm md:text-[15px] font-bold uppercase tracking-tight leading-none">
              {item.title}
            </h5>
          </div>
          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">
            Origins: {item.origins || "Original"}
          </p>
        </div>
      </div>
    </div>
  );
});
