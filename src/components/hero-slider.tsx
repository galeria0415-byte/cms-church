"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type SlideItem = {
  id: string;
  title: string | null;
  caption: string | null;
  mediaUrl: string;
  mediaType: string;
  linkUrl: string | null;
  linkLabel: string | null;
};

export function HeroSlider({ slides }: { slides: SlideItem[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = slides.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setTimeout(next, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, paused, next, total]);

  if (total === 0) return null;

  const slide = slides[current];

  return (
    <div
      className="group relative w-full overflow-hidden bg-[var(--ink)]"
      style={{ aspectRatio: "16/7", maxHeight: "600px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Media */}
      {slide.mediaType === "video" ? (
        <video
          key={slide.id}
          src={slide.mediaUrl}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          key={slide.id}
          src={slide.mediaUrl}
          alt={slide.title ?? ""}
          className="h-full w-full object-cover transition-opacity duration-700"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Text overlay */}
      {(slide.title || slide.caption) && (
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {slide.title && (
              <h2 className="font-serif text-2xl font-semibold text-white drop-shadow-sm lg:text-4xl">
                {slide.title}
              </h2>
            )}
            {slide.caption && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85 lg:text-base">
                {slide.caption}
              </p>
            )}
            {slide.linkUrl && (
              <a
                href={slide.linkUrl}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-white/90"
                target="_blank"
                rel="noopener noreferrer"
              >
                {slide.linkLabel ?? "Learn more"}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Arrows — only visible on hover when multiple slides */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/60 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/60 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {total > 1 && !paused && (
        <div
          key={`${current}-progress`}
          className="absolute bottom-0 left-0 h-0.5 bg-white/60"
          style={{ animation: "slide-progress 5s linear forwards" }}
        />
      )}

      <style>{`
        @keyframes slide-progress {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>
    </div>
  );
}
