import {
  Clapperboard,
  Gem,
  Layers3,
  PenTool,
  PhoneCall,
  Play,
  Sparkles,
  Sun,
  Tv,
  User,
} from "lucide-react";
import { TheatreItem } from "../types";

type IconProps = {
  className?: string;
};

type Category = TheatreItem["category"];

export function PresenceIcon({ className = "" }: IconProps) {
  return <Sun className={className} />;
}

export function ReleasesIcon({ className = "" }: IconProps) {
  return <Clapperboard className={className} />;
}

export function CreditsIcon({ className = "" }: IconProps) {
  return <Gem className={className} />;
}

export function ScriptsIcon({ className = "" }: IconProps) {
  return <PenTool className={className} />;
}

export function EditsIcon({ className = "" }: IconProps) {
  return <Play className={className} />;
}

export function PostersIcon({ className = "" }: IconProps) {
  return <Sparkles className={className} />;
}

export function OriginalsIcon({ className = "" }: IconProps) {
  return <Tv className={className} />;
}

export function SetsIcon({ className = "" }: IconProps) {
  return <Layers3 className={className} />;
}

export function CallsIcon({ className = "" }: IconProps) {
  return <PhoneCall className={className} />;
}

export function ProfileIcon({ className = "" }: IconProps) {
  return <User className={className} />;
}

export function CategoryIcon({
  category,
  className = "",
}: {
  category?: Category;
  className?: string;
}) {
  switch (category) {
    case "Edit":
      return <EditsIcon className={className} />;
    case "Script":
      return <ScriptsIcon className={className} />;
    case "Poster":
      return <PostersIcon className={className} />;
    case "Original":
      return <OriginalsIcon className={className} />;
    case "Call":
      return <CallsIcon className={className} />;
    default:
      return null;
  }
}
