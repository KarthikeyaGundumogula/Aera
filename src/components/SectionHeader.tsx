import { memo, ElementType, ReactNode } from "react";

interface SectionHeaderProps {
  icon?: ElementType;
  iconNode?: ReactNode;
  title: string;
  className?: string; // Appends icon classes
  containerClassName?: string;
  iconClassName?: string;
}

export const SectionHeader = memo(({ icon: Icon, iconNode, title, className = "", containerClassName = "", iconClassName="w-4 h-4" }: SectionHeaderProps) => {
  return (
    <div className={`flex items-center gap-3 opacity-60 ${containerClassName} ${className}`}>
      {iconNode ? iconNode : Icon ? <Icon className={iconClassName} /> : <div className="w-1 h-3 bg-brand-accent/50 rounded-full" />}
      <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-white/80 drop-shadow-md">
        {title}
      </h3>
      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-2" />
    </div>
  );
});
