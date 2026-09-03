import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  id: string;
  /** Small uppercase label above the headline. Optional. */
  eyebrow?: string;
  headline: string;
  /** One muted line under the headline. Optional. */
  sub?: string;
  className?: string;
}

/**
 * The heading block every section shares: eyebrow, headline, gold rule, and an
 * optional line of support, centred in a measured column.
 *
 * Having one component for this is what makes the sections feel like one page
 * rather than a stack of separate ones: identical type scale, identical
 * rhythm, identical alignment everywhere.
 */
export default function SectionHeading({
  id,
  eyebrow,
  headline,
  sub,
  className,
}: SectionHeadingProps) {
  // A headline may force its own break with "\n" when the natural wrap falls
  // in the wrong place. Those get a wider measure, since the break is already
  // decided and a narrow column would only wrap them a second time.
  const hasBreak = headline.includes("\n");

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      {eyebrow ? <p className="eyebrow mb-4 text-gold/85">{eyebrow}</p> : null}
      <h2
        id={id}
        className={cn(
          "whitespace-pre-line font-display text-[36px] leading-display tracking-tightest text-bone sm:text-[52px] lg:text-[62px]",
          hasBreak ? "max-w-[22ch]" : "max-w-[16ch]",
        )}
      >
        {headline}
      </h2>
      <div className="rule-gold mt-6" aria-hidden="true" />
      {sub ? (
        <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-mute sm:text-[17px]">{sub}</p>
      ) : null}
    </div>
  );
}
