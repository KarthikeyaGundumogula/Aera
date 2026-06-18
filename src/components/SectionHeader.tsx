import { memo, ElementType, ReactNode } from "react";

interface SectionHeaderProps {
  icon?: ElementType;
  iconNode?: ReactNode;
  title: string;
  className?: string; // Appends icon classes
  containerClassName?: string;
  iconClassName?: string;
  actionNode?: ReactNode;
}

export const SectionHeader = memo(({ icon: Icon, iconNode, title, actionNode, className = "", containerClassName = "", iconClassName="w-4 h-4" }: SectionHeaderProps) => {
  return (
    <div className={`flex items-center justify-between opacity-100 ${containerClassName} ${className}`}>
      <div className="flex items-center gap-3">
        {iconNode ? iconNode : Icon ? <Icon className={iconClassName} /> : <div className="w-4 h-px bg-white" />}
        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-white/80 drop-shadow-md">
          {title}
        </h3>
        <div className="h-px w-12 bg-gradient-to-r from-white/10 to-transparent ml-2" />
      </div>
      {actionNode && <div>{actionNode}</div>}
    </div>
  );
});
