import {
  Clapperboard,
  PenTool,
  Play,
  Sparkles,
  Sun,
} from "lucide-react";
import { TheatreItem } from "../../types";

type IconProps = {
  className?: string;
};

type Category = TheatreItem["category"];

export function StageIcon({ className = "" }: IconProps) {
  return <Sun className={className} />;
}

export function WorksIcon({ className = "" }: IconProps) {
  return <Clapperboard className={className} />;
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

