import Image from "next/image";
import CountUp from "@/components/motion/CountUp";
import FadeUp from "@/components/motion/FadeUp";
import { cn } from "@/lib/cn";
import SectionHeading from "@/components/ui/SectionHeading";
import { proof, scoreShots, type ScoreShot } from "@/content/site";

/**
 * 3b. SCORE STRIP. Bureau screenshots, before and after side by side, with
 * dates. Sits under the proof wall and backs the photos with numbers.
 *
 * Snap scroller on phones, three across from lg. Only the after score
 * animates: it counts up from the before score when it scrolls into view.
 */
export default function ScoreStrip() {
  return (
    <section
      id="scores"
      aria-labelledby="scores-headline"
      className="bg-ink px-5 py-20 sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-page">
        <FadeUp>
          <SectionHeading
            id="scores-headline"
            headline={proof.scoreStripHeadline}
            sub={proof.scoreStripSubheadline}
          />
        </FadeUp>

        <FadeUp delay={0.1} className="mt-10 sm:mt-14">
          <ul
            className={cn(
              "-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-pl-5 px-5 scrollbar-none",
              "sm:-mx-8 sm:scroll-pl-8 sm:px-8",
              "lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-x-4 lg:gap-y-12 lg:overflow-visible lg:px-0",
            )}
          >
            {scoreShots.map((shot) => (
              <li
                key={shot.id}
                className="w-[82vw] max-w-[380px] shrink-0 snap-start lg:w-auto lg:max-w-none"
              >
                <ScorePair shot={shot} />
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </section>
  );
}

/** Before | after pair with a hairline between, label above. */
function ScorePair({ shot }: { shot: ScoreShot }) {
  return (
    <figure>
      <figcaption className="text-[13px] text-mute">{shot.label}</figcaption>
      <div className="relative mt-3 grid grid-cols-2 gap-x-4">
        <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line" />
        <ScoreHalf side="Before" entry={shot.before} label={shot.label} />
        <ScoreHalf side="After" entry={shot.after} label={shot.label} countFrom={shot.before.score} />
      </div>
    </figure>
  );
}

interface ScoreHalfProps {
  side: "Before" | "After";
  entry: ScoreShot["before"];
  label: string;
  /** When set, the score counts up from this value on view. */
  countFrom?: number;
}

function ScoreHalf({ side, entry, label, countFrom }: ScoreHalfProps) {
  const scoreClass = "font-display text-[28px] leading-none text-gold sm:text-[32px]";

  return (
    <div>
      <div className="relative aspect-[4/5] bg-ink-2">
        <Image
          src={entry.image}
          alt={`${proof.lightboxHint}: ${label}, ${side.toLowerCase()}`}
          fill
          sizes="(min-width:1024px) 16vw, 40vw"
          quality={70}
          className="object-cover object-top"
        />
      </div>
      <p className="mt-3">
        {countFrom === undefined ? (
          <span className={cn("tabular", scoreClass)}>{entry.score}</span>
        ) : (
          <CountUp from={countFrom} to={entry.score} startOnView className={scoreClass} />
        )}
      </p>
      {/* Explicit spaces so the label can break at the separator; the date
          never wraps mid-string, so a long month drops whole to line two. */}
      <p className="eyebrow mt-1.5">
        {side} <span aria-hidden="true">&middot;</span>{" "}
        <span className="whitespace-nowrap">{entry.date}</span>
      </p>
    </div>
  );
}
