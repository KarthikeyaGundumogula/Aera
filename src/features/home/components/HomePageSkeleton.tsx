/**
 * HomePageSkeleton — Cinematic shimmer skeleton for the Home Feed.
 * Mirrors the exact section layout of HomeFeedLayout so the transition
 * from skeleton → real content is imperceptible.
 */
import React from "react";

const shimmer =
  "relative overflow-hidden bg-white/[0.04] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent";

function SkeletonBlock({ className = "", style }: { className?: string, style?: React.CSSProperties }) {
  return <div className={`${shimmer} rounded-lg ${className}`} style={style} />;
}

export function HomePageSkeleton() {
  return (
    <div className="bg-[#050505] min-h-screen text-white pb-24">
      {/* Header skeleton */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#050505]/95 border-b border-white/5 md:px-8 md:py-6">
        <SkeletonBlock className="h-5 w-20 rounded-md" />
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-5 w-5 rounded-full" />
          <SkeletonBlock className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <main className="pt-20 md:pt-24 px-0 w-full">
        {/* Hero skeleton — mirrors 65vh / 80vh hero */}
        <section className="px-4 md:px-0 mb-0">
          <div className="relative h-[65vh] md:h-[80vh] rounded-2xl md:rounded-none overflow-hidden">
            <SkeletonBlock className="absolute inset-0 rounded-2xl md:rounded-none" />
            {/* Bottom overlay text area */}
            <div className="absolute bottom-0 left-0 p-6 w-full space-y-3">
              <div className="flex gap-2">
                <SkeletonBlock className="h-4 w-14 rounded-sm" />
                <SkeletonBlock className="h-4 w-20 rounded-sm" />
              </div>
              <SkeletonBlock className="h-10 w-3/4 rounded-md" />
              <SkeletonBlock className="h-10 w-1/2 rounded-md" />
              <SkeletonBlock className="h-4 w-24 rounded-sm mt-4" />
            </div>
            {/* Indicator dots */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <SkeletonBlock key={i} className="w-1 h-10 rounded-full" />
              ))}
            </div>
          </div>
        </section>

        {/* Ticker skeleton */}
        <div className="my-4 px-6 md:px-12">
          <SkeletonBlock className="h-4 w-full rounded-full" />
        </div>

        {/* Artists section skeleton */}
        <section className="mt-4 mb-12 px-6 md:px-12">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <SkeletonBlock className="h-3.5 w-3.5 rounded-sm" />
            <SkeletonBlock className="h-3 w-24 rounded-sm" />
          </div>
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`${shimmer} rounded-xl flex-shrink-0 h-16 w-[200px] md:w-[320px]`}
              />
            ))}
          </div>
        </section>

        {/* Originals section skeleton */}
        <section className="mb-12 px-6 md:px-12">
          <div className="flex items-center gap-3 mb-6">
            <SkeletonBlock className="h-3.5 w-3.5 rounded-sm" />
            <SkeletonBlock className="h-3 w-20 rounded-sm" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </section>

        {/* Feed section skeleton — mobile: vertical stack / desktop: grid */}
        <section className="px-4 sm:px-12 mb-12">
          <div className="flex items-center gap-3 mb-8 px-2 sm:px-0">
            <SkeletonBlock className="h-3.5 w-3.5 rounded-sm" />
            <SkeletonBlock className="h-3 w-16 rounded-sm" />
          </div>
          {/* Mobile stack */}
          <div className="flex sm:hidden flex-col gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock
                key={i}
                className="w-full rounded-xl"
                style={{ aspectRatio: i % 2 === 0 ? "16/9" : "1" } as React.CSSProperties}
              />
            ))}
          </div>
          {/* Desktop cluster approximation */}
          <div className="hidden sm:grid grid-cols-3 gap-[2px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock
                key={i}
                className={`rounded-none ${i === 0 ? "col-span-2 aspect-video" : "aspect-square"}`}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
