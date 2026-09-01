import Image from "next/image";
import CtaButton from "@/components/ui/CtaButton";
import CountUp from "@/components/motion/CountUp";
import FadeUp from "@/components/motion/FadeUp";
import { finalCta } from "@/content/site";

/**
 * 9. RISK REVERSAL + FINAL CTA. The hero frame again, closing the argument:
 * full viewport, still photo under the vignette, headline in the hero scale,
 * gold CTA, trust badges, live client count.
 *
 * Below the fold, so the photo is lazy (the hero owns the only priority image)
 * and the copy rises with <FadeUp /> instead of the CSS reveal. The sticky bar
 * watches `#final-cta` and hides itself while this is on screen.
 */
export default function FinalCta() {
  // "Join {count}+ clients" -> ["Join ", "+ clients"]; the counter sits between.
  const [countBefore, countAfter = ""] = finalCta.clientCount.label.split("{count}");

  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-headline"
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink"
    >
      {/* Photography layer */}
      <div className="vignette absolute inset-0">
        <Image
          src={finalCta.image}
          alt={finalCta.imageAlt}
          fill
          loading="lazy"
          sizes="100vw"
          quality={70}
          className="object-cover"
        />
      </div>

      {/* Copy layer */}
      <div className="relative z-10 mx-auto w-full max-w-page px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:pb-24">
        <FadeUp>
          <h2
            id="final-cta-headline"
            className="max-w-[12ch] font-display text-[42px] leading-display tracking-tightest text-bone sm:text-7xl lg:text-8xl"
          >
            {finalCta.headline}
          </h2>
        </FadeUp>

        <FadeUp delay={0.06}>
          <p className="mt-5 max-w-[34rem] text-[16px] leading-relaxed text-bone/80 sm:mt-6 sm:text-lg">
            {finalCta.body}
          </p>
        </FadeUp>

        {/* Primary CTA */}
        <FadeUp delay={0.12} className="mt-8 max-w-md sm:mt-10">
          <CtaButton section="final" label={finalCta.cta.label} block className="sm:w-auto" />
          <p className="mt-3 text-[13px] leading-snug text-mute">{finalCta.cta.subtext}</p>
        </FadeUp>

        {/* Trust badges */}
        <FadeUp delay={0.18}>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 sm:mt-10" aria-label="Trust">
            {finalCta.badges.map((badge, i) => (
              <li key={badge} className="eyebrow flex items-center gap-2 text-bone/70">
                {i === 0 && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5 shrink-0"
                  >
                    <rect x="3" y="7" width="10" height="7" rx="1" />
                    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                  </svg>
                )}
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gold" />
                {badge}
              </li>
            ))}
          </ul>
        </FadeUp>

        {/* Client count */}
        <FadeUp delay={0.24}>
          <p className="mt-8 text-[14px] text-mute sm:mt-10">
            {countBefore}
            <CountUp
              startOnView
              from={0}
              to={finalCta.clientCount.value}
              thousands
              className="font-display text-2xl leading-none tracking-tightest text-gold"
            />
            {countAfter}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
