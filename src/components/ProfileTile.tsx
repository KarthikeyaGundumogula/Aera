import React from "react";
import { ArtistAvatar } from "./ArtistAvatar";

export interface ProfileTileProps {
  id: string;
  name: string;
  handle: string;
  avatar?: string | null;
  role?: string;
  actionIcon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ProfileTile({
  name,
  handle,
  avatar,
  role,
  actionIcon,
  onClick,
  className = "",
}: ProfileTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition-all text-left group ${className}`}
    >
      <div className="flex items-center gap-3">
        <ArtistAvatar
          src={avatar}
          name={name}
          size={32}
          className="rounded-full flex-shrink-0"
        />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white group-hover:text-white transition-colors">
            {name}
          </span>
          <span className="text-[10px] text-white/40">@{handle}</span>
        </div>
      </div>
      {(role || actionIcon) && (
        <div className="flex items-center gap-2">
          {role && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
              {role}
            </span>
          )}
          {actionIcon && (
            <span className="text-white/40 group-hover:text-white transition-colors">
              {actionIcon}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
