import { useState } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Set to "eager" only for above-the-fold hero images. Default: "lazy" */
  loading?: "lazy" | "eager";
  /** Extra classes applied to the wrapper div, not the img itself */
  wrapperClassName?: string;
  /** If true, a shimmer placeholder is shown while the image loads */
  shimmer?: boolean;
}

/**
 * LazyImage
 * ---------
 * Drop-in replacement for <img> that enforces:
 *  - loading="lazy"  (native browser lazy-load)
 *  - decoding="async" (non-blocking decode on worker thread)
 *  - blur-up fade-in transition (opacity 0 → 1 once decoded)
 *  - optional shimmer placeholder skeleton
 *
 * Hardware-accelerated: the fade uses `opacity` only — no layout properties.
 */
export function LazyImage({
  src,
  alt,
  loading = "lazy",
  className = "",
  wrapperClassName,
  shimmer = false,
  style,
  ...rest
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={wrapperClassName}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Shimmer skeleton shown while image hasn't loaded yet */}
      {shimmer && !loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-white/[0.05]"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={className}
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
          willChange: "opacity",
          ...style,
        }}
        {...rest}
      />
    </div>
  );
}
