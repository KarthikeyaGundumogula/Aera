/**
 * CinematicInput.tsx
 *
 * Shared cinematic text input / textarea for the recommendation flow.
 * Renders a labelled field with an underline-only border and amber focus state.
 */
import React from "react";

interface CinematicInputProps {
  id: string;
  label: string;
  sublabel?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  as?: "input" | "textarea";
  maxLength?: number;
  autoFocus?: boolean;
}

export function CinematicInput({
  id,
  label,
  sublabel,
  placeholder,
  value,
  onChange,
  as = "input",
  maxLength,
  autoFocus,
}: CinematicInputProps) {
  const Tag = as;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30"
        >
          {label}
        </label>
        {sublabel && (
          <span className="text-[9px] text-white/20 tracking-wide">{sublabel}</span>
        )}
      </div>
      <Tag
        id={id}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        maxLength={maxLength}
        rows={as === "textarea" ? 3 : undefined}
        autoFocus={autoFocus}
        className={[
          "w-full bg-transparent text-white/90 placeholder-white/15",
          "border-0 border-b border-white/10 focus:border-[#D97706]/50",
          "py-2 text-sm font-light outline-none resize-none",
          "transition-colors duration-300",
          as === "textarea" ? "leading-relaxed" : "",
        ].join(" ")}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
