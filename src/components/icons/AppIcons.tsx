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

export function SpiritIcon({ className = "" }: IconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 2v14" />
      <path d="M4 4h14" />
      <path d="M7 4v8l4-2 4 2V4" />
      <circle cx="12" cy="16" r="2" />
      <path d="M9 22v-2a3 3 0 0 1 6 0v2" />
      <circle cx="6" cy="17" r="1.5" />
      <path d="M3 22v-1.5a2.5 2.5 0 0 1 5 0v1.5" />
      <circle cx="18" cy="17" r="1.5" />
      <path d="M15 22v-1.5a2.5 2.5 0 0 1 5 0v1.5" />
    </svg>
  );
}

