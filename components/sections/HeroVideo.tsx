"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface HeroVideoProps {
  src: string;
}

/**
 * Autoplaying, muted, looping background video.
 *
 * Mounted after hydration so it never competes with the priority next/image
 * behind it. That image doubles as the poster: no `poster` attribute here,
 * since the video is opacity-0 until it plays and the attribute would only
 * re-download the raw file. (The h1, not the image, is the LCP element; the
 * browser excludes full-viewport images from LCP.) Skipped entirely when the
 * visitor prefers reduced motion or has Data Saver on. Fades in only once the
 * first frame is ready so there is never a black flash over the poster.
 *
 * Ships a pause/play control (WCAG 2.2.2) in the free top corner. It is
 * rendered only when the video itself mounts, so there is no dead button under
 * reduced motion or Data Saver.
 */
export default function HeroVideo({ src }: HeroVideoProps) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
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
    play(el);
  }, [enabled]);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      play(v);
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  }

  if (!enabled) return null;

  return (
    <>
      <video
        ref={ref}
        src={src}
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

      {/* z-20 lifts the control above the copy layer (z-10) and the vignette ::after overlay. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={paused ? "Play background video" : "Pause background video"}
        className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-[3px] bg-ink/40 text-bone/80 transition-colors hover:text-bone sm:right-8 sm:top-8"
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinejoin="round"
        >
          {paused ? <path d="M5.5 3.5v11l9-5.5z" /> : <path d="M6 3.5v11M12 3.5v11" />}
        </svg>
      </button>
    </>
  );
}

/** play() returns undefined in old browsers; swallow autoplay rejections either way. */
function play(el: HTMLVideoElement) {
  const p = el.play();
  if (p && typeof p.catch === "function") p.catch(() => {});
}
