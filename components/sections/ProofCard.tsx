"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import CountUp from "@/components/motion/CountUp";
import ProofLightbox from "@/components/sections/ProofLightbox";
import { cn } from "@/lib/cn";
import type { ProofClient } from "@/content/site";

/** Slight aspect variation from lg so the masonry never reads as a grid. */
const LG_ASPECT = ["lg:aspect-[4/5]", "lg:aspect-[3/4]", "lg:aspect-[5/6]"] as const;

interface ProofCardProps {
  client: ProofClient;
  /** Position in the wall. Picks the desktop aspect ratio. */
  index: number;
  onOpen: (client: ProofClient, opener: HTMLButtonElement) => void;
}

/**
 * One photo card in the proof wall. The whole card is a button that opens the
 * score lightbox. Full-bleed photo with the vignette; caption bottom left:
 * name, before and after (after counts up when it scrolls into view), and
 * what they were approved for.
 */
export default function ProofCard({ client, index, onOpen }: ProofCardProps) {
  return (
    <button
      type="button"
      onClick={(e) => onOpen(client, e.currentTarget)}
      aria-label={`View credit score for ${client.name}. Before ${client.before}, after ${client.after}. Approved: ${client.approved}.`}
      className={cn(
        "group vignette relative block aspect-[4/5] w-full overflow-hidden bg-ink-2 text-left",
        LG_ASPECT[index % LG_ASPECT.length],
      )}
    >
      <Image
        src={client.photo}
        alt={client.photoAlt}
        fill
        sizes="(min-width:1024px) 33vw, 78vw"
        quality={70}
        className="object-cover transition-transform duration-1000 ease-expensive motion-safe:group-hover:scale-[1.03]"
      />

      {/* Caption sits above the vignette's ::after layer. */}
      <span className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
        <span className="block font-sans text-[14px] font-medium text-bone">{client.name}</span>
        <span className="mt-1.5 flex items-baseline gap-x-1.5">
          <span className="eyebrow text-bone/70">Before</span>
          <span className="font-display text-[24px] leading-none text-gold tabular">{client.before}</span>
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-mute"
          >
            <path d="M1.5 7h11M8.5 3l4 4-4 4" />
          </svg>
          <span className="eyebrow text-bone/70">After</span>
          <CountUp
            from={client.before}
            to={client.after}
            startOnView
            className="font-display text-[24px] leading-none text-gold"
          />
        </span>
        <span className="eyebrow mt-2 block text-bone/70">Approved: {client.approved}</span>
      </span>
    </button>
  );
}

interface ProofGalleryProps {
  clients: ProofClient[];
}

/**
 * The gallery: snap scroller with a peek of the next card on phones, three
 * column CSS masonry from lg. Owns which card's lightbox is open and hands
 * focus back to the card that opened it. Lives here rather than in its own
 * file so ProofWall can stay a server component.
 */
export function ProofGallery({ clients }: ProofGalleryProps) {
  const [active, setActive] = useState<ProofClient | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const open = useCallback((client: ProofClient, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setActive(client);
  }, []);

  const close = useCallback(() => {
    setActive(null);
    openerRef.current?.focus({ preventScroll: true });
    openerRef.current = null;
  }, []);

  return (
    <>
      <ul
        className={cn(
          // Phone: horizontal snap scroller bleeding to the viewport edges.
          // The vertical padding keeps a card's focus ring from being clipped.
          "-mx-5 -my-1.5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-pl-5 px-5 py-1.5 scrollbar-none",
          "sm:-mx-8 sm:scroll-pl-8 sm:px-8",
          // Desktop: CSS columns masonry.
          "lg:mx-0 lg:my-0 lg:block lg:columns-3 lg:gap-4 lg:overflow-visible lg:px-0 lg:py-0",
        )}
      >
        {clients.map((client, index) => (
          <li
            key={client.id}
            className="w-[78vw] max-w-[340px] shrink-0 snap-start lg:mb-4 lg:w-auto lg:max-w-none lg:break-inside-avoid"
          >
            <ProofCard client={client} index={index} onOpen={open} />
          </li>
        ))}
      </ul>

      <ProofLightbox client={active} onClose={close} />
    </>
  );
}
