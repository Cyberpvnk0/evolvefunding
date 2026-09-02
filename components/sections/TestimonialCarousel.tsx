"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Testimonial } from "@/content/site";

interface TestimonialCarouselProps {
  items: Testimonial[];
}

/**
 * Horizontal scroll-snap carousel of client quotes. One slide per view on
 * phones, two from `sm`.
 *
 * Swiping is native scrolling, so it works before hydration and needs no
 * touch handling. The client side only adds the previous/next buttons and
 * keeps the dots in step with the scroll position. Snap points are measured
 * from the DOM rather than assumed, so the dots always match the positions
 * the track can actually reach (a two-up view has one fewer stop than slides,
 * because the last slide cannot align to the start without scrolling past the
 * end). No autoplay. Programmatic scrolls are instant when the visitor prefers
 * reduced motion.
 */
export default function TestimonialCarousel({ items }: TestimonialCarouselProps) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const raf = useRef(0);
  const [active, setActive] = useState(0);
  const [stops, setStops] = useState(items.length);

  /** Re-read the scroll position and update the dots. */
  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const points = snapPoints(track);
    const x = track.scrollLeft;
    let nearest = 0;
    points.forEach((p, i) => {
      if (Math.abs(p - x) < Math.abs(points[nearest] - x)) nearest = i;
    });
    setStops(points.length);
    setActive(nearest);
  }, []);

  /** One `sync` per frame, however many scroll or resize events arrive. */
  const schedule = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      sync();
    });
  }, [sync]);

  useEffect(() => {
    sync();
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf.current);
    };
  }, [sync, schedule]);

  const go = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const next = active + dir;
    if (next < 0 || next >= stops) return;
    const points = snapPoints(track);
    const stride = points.length > 1 ? points[1] - points[0] : track.clientWidth;
    track.scrollBy({ left: dir * stride, behavior: reduce ? "auto" : "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Testimonials">
      {/* Track: native scroll-snap, bleeds to the page edges like the other scrollers. */}
      <ul
        ref={trackRef}
        role="list"
        onScroll={schedule}
        className="relative -mx-5 flex snap-x snap-mandatory gap-x-8 overflow-x-auto overscroll-x-contain scroll-px-5 px-5 scrollbar-none sm:-mx-8 sm:gap-x-12 sm:scroll-px-8 sm:px-8 lg:gap-x-14"
      >
        {items.map((t) => (
          <li key={t.id} className="flex w-full shrink-0 snap-start sm:w-[calc(50%-1.5rem)] lg:w-[calc(50%-1.75rem)]">
            <figure className="flex w-full flex-col items-center border-t border-line pt-8 text-center sm:pt-10">
              {/* The opening mark hangs into the margin so the first letter sits on the left edge. */}
              <blockquote className="max-w-[24ch] font-display text-[27px] font-extrabold leading-snugger tracking-tightest text-bone sm:max-w-none sm:text-[34px] lg:text-[40px]">
                <p>&ldquo;{t.quote}&rdquo;</p>
              </blockquote>

              {/* Pushed to the bottom so avatars line up across slides of different length. */}
              <figcaption className="mt-auto flex flex-col items-center gap-3 pt-8 sm:flex-row sm:pt-10 lg:pt-12">
                <Image
                  src={t.avatar}
                  alt=""
                  width={40}
                  height={40}
                  sizes="40px"
                  quality={70}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 text-center sm:text-left">
                  <p className="text-[14px] leading-snug text-bone">{t.name}</p>
                  <p className="eyebrow mt-1">{t.city}</p>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {/* Controls: dots on the left, previous/next on the right. */}
      {stops > 1 && (
        <div className="mt-8 flex items-center justify-center gap-6 sm:mt-10">
          <ol className="flex items-center gap-2.5" aria-hidden="true">
            {Array.from({ length: stops }, (_, i) => (
              <li
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                  i === active ? "bg-gold" : "bg-bone/20",
                )}
              />
            ))}
          </ol>
          <p className="sr-only" aria-live="polite">
            Slide {active + 1} of {stops}
          </p>

          <div className="flex gap-3">
            <ArrowButton label="Previous" dir={-1} disabled={active === 0} onClick={() => go(-1)} />
            <ArrowButton label="Next" dir={1} disabled={active === stops - 1} onClick={() => go(1)} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The `scrollLeft` of every distinct snap position, in order. Positions past
 * the end of the track collapse onto the last reachable one.
 */
function snapPoints(track: HTMLElement): number[] {
  const max = track.scrollWidth - track.clientWidth;
  const slides = Array.from(track.children) as HTMLElement[];
  const first = slides[0]?.offsetLeft ?? 0;
  const points: number[] = [];
  for (const slide of slides) {
    const x = Math.min(slide.offsetLeft - first, max);
    if (points.length === 0 || x - points[points.length - 1] > 1) points.push(x);
  }
  return points;
}

interface ArrowButtonProps {
  label: string;
  dir: -1 | 1;
  disabled: boolean;
  onClick: () => void;
}

/**
 * 44px hairline square with a 1.25px chevron. Uses `aria-disabled` rather
 * than `disabled` so focus is not lost when the visitor reaches either end.
 */
function ArrowButton({ label, dir, disabled, onClick }: ArrowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-disabled={disabled}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-[3px] border border-line text-bone",
        "transition-colors duration-200 ease-expensive hover:border-bone/40",
        "aria-disabled:pointer-events-none aria-disabled:text-bone/25",
      )}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={dir === -1 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}
