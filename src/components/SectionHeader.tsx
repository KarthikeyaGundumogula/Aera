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
    <div className={`flex items-center gap-2 opacity-40 ${containerClassName} ${className}`}>
      {iconNode ? iconNode : Icon ? <Icon className={iconClassName} /> : null}
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">{title}</h3>
    </div>
  );
});
