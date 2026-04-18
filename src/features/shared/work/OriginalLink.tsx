import React from "react";
import { useNavigate } from "react-router-dom";
import { TheatreItem } from "../../../types";

interface OriginalLinkProps {
  item: TheatreItem;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  key?: React.Key;
}

/**
 * A wrapper component that handles native navigation to an Original's detail page.
 * Use this for Hero items or any card that represents a landing page for a Movie/Series.
 */
export function OriginalLink({ item, children, className = "", onClick }: OriginalLinkProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
    
    if (item.originalIds?.[0]) {
      navigate(`/originals/${item.originalIds[0]}`);
    }
  };

  return (
    <div onClick={handleClick} className={`cursor-pointer ${className}`}>
      {children}
    </div>
  );
}
