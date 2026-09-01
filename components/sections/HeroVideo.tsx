"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface HeroVideoProps {
  src: string;
  poster: string;
}

/**
 * Autoplaying, muted, looping background video.
 *
 * Mounted after hydration so the poster (a priority next/image behind it) is
 * the LCP element and the video never competes with it. Skipped entirely when
 * the visitor prefers reduced motion or has Data Saver on. Fades in only once
 * the first frame is ready so there is never a black flash over the poster.
 */
export default function HeroVideo({ src, poster }: HeroVideoProps) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const saveData = nav.connection?.saveData === true;
    if (!reduce && !saveData) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const p = el.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [enabled]);

  if (!enabled) return null;

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setReady(true)}
      onLoadedData={() => setReady(true)}
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out",
        ready ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
