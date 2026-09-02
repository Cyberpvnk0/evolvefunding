"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { track } from "@/lib/analytics";
import type { Vsl } from "@/content/site";

interface VslPlayerProps {
  vsl: Vsl;
  /** The poster is above the fold, so the hero passes priority for it. */
  priority?: boolean;
}

/**
 * The hero's video sales letter.
 *
 * Costs nothing until it is played. For a self-hosted file the <video> element
 * is in the DOM from the start but carries `preload="none"`, so not a byte is
 * fetched until play() is called; for an embed the iframe is only created on
 * click, so the platform's scripts never load for a visitor who does not watch.
 * Either way an unplayed VSL adds no weight to the page, which is what lets it
 * sit above the fold without wrecking mobile performance.
 *
 * play() is called SYNCHRONOUSLY inside the click handler, never from an
 * effect. A VSL is spoken, so it has to start with sound, and browsers only
 * allow unmuted playback while a user gesture is being handled. Starting it a
 * tick later (after a state update and re-render) loses that permission and
 * the browser silently blocks it, costing a second click on the single most
 * important element on the page.
 *
 * Watch-through is the number that matters here, so the player reports
 * `vsl_play`, `vsl_progress` at each quarter, and `vsl_complete`. For an embed
 * the platform owns playback, so only `vsl_play` fires.
 */
export default function VslPlayer({ vsl, priority = false }: VslPlayerProps) {
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Quarters already reported, so scrubbing backwards cannot double-count.
  const milestones = useRef<Set<number>>(new Set());

  const isFile = vsl.type === "file";

  const onPlayClick = useCallback(() => {
    track("vsl_play", { type: vsl.type });
    setStarted(true);

    if (!isFile) return;
    const el = videoRef.current;
    if (!el) return;
    // Synchronous, inside the gesture: this is what buys us sound.
    el.muted = false;
    const p = el.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // Blocked anyway (an aggressive setting, or a data-saver mode). The
        // native controls are showing by now, so the visitor can start it.
        el.controls = true;
      });
    }
  }, [isFile, vsl.type]);

  const onTimeUpdate = () => {
    const el = videoRef.current;
    if (!el?.duration || !Number.isFinite(el.duration)) return;
    const pct = (el.currentTime / el.duration) * 100;
    for (const mark of [25, 50, 75]) {
      if (pct >= mark && !milestones.current.has(mark)) {
        milestones.current.add(mark);
        track("vsl_progress", { percent: mark });
      }
    }
  };

  const embedSrc = vsl.embedUrl
    ? `${vsl.embedUrl}${vsl.embedUrl.includes("?") ? "&" : "?"}autoplay=1`
    : "";

  return (
    <div
      className="surface relative w-full overflow-hidden rounded-[3px]"
      style={{ aspectRatio: vsl.aspect }}
    >
      {/* Self-hosted: mounted from the start, but preload="none" means no
          bytes move until play() runs. */}
      {isFile && (
        <video
          ref={videoRef}
          src={vsl.src}
          preload="none"
          playsInline
          controls={started}
          onTimeUpdate={onTimeUpdate}
          onEnded={() => track("vsl_complete")}
          className="absolute inset-0 h-full w-full bg-ink object-contain"
        >
          {vsl.captions ? (
            <track kind="captions" src={vsl.captions} srcLang="en" label="English" default />
          ) : null}
        </video>
      )}

      {/* Embed: the iframe does not exist until it is asked for. */}
      {!isFile && started && embedSrc && (
        <iframe
          src={embedSrc}
          title={vsl.playLabel}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      )}

      {/* Poster and play control, removed once playback begins. */}
      {!started && (
        <>
          <Image
            src={vsl.poster}
            alt={vsl.posterAlt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 900px, 100vw"
            quality={72}
            className="object-cover"
          />
          {/* Darken the poster so the play control stays legible on any frame. */}
          <div aria-hidden="true" className="absolute inset-0 bg-ink/35" />
          <button
            type="button"
            onClick={onPlayClick}
            aria-label={vsl.playLabel}
            className="group absolute inset-0 flex cursor-pointer items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-gold"
          >
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gold text-ink shadow-[0_8px_40px_rgba(10,10,10,0.55)] transition-transform duration-300 ease-expensive group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:h-20 sm:w-20">
              <svg aria-hidden="true" width="26" height="30" viewBox="0 0 26 30" fill="currentColor">
                <path d="M25 13.27a2 2 0 0 1 0 3.46L3 29.4A2 2 0 0 1 0 27.66V2.34A2 2 0 0 1 3 .6l22 12.67Z" />
              </svg>
            </span>
          </button>
        </>
      )}
    </div>
  );
}
