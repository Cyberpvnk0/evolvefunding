import CtaButton from "@/components/ui/CtaButton";
import FadeUp from "@/components/motion/FadeUp";
import SectionHeading from "@/components/ui/SectionHeading";
import { hero, included, offer } from "@/content/site";

/**
 * 6. WHAT'S INCLUDED. One raised card, centred: the inclusions as a
 * hairline-separated list, the value anchor, then a checkout button.
 *
 * A single surface, not a grid. The card carries the `.surface` treatment (top
 * rim light, vertical gradient, wide soft shadow) and sits over a faint pool of
 * warm light, so the offer visibly lifts off the page instead of lying flat on
 * it. The rows keep their text left-aligned inside the centred card: a list of
 * six differing lengths is far easier to scan ragged-right than centred.
 */
export default function Included() {
  return (
    <section
      id="included"
      aria-labelledby="included-headline"
      className="light-pool relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="relative mx-auto max-w-page">
        <FadeUp>
          <SectionHeading id="included-headline" headline={included.headline} />
        </FadeUp>

        <FadeUp delay={0.08}>
          <div className="surface mx-auto mt-10 max-w-2xl rounded-[3px] p-6 sm:mt-14 sm:p-10">
            <ul>
              {included.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-t border-line py-4 text-[16px] leading-relaxed text-bone/90 first:border-t-0 first:pt-0"
                >
                  {/* Offset so the dot sits on the centre of the first line: (1.625em - 0.25em) / 2. */}
                  <span aria-hidden="true" className="mt-[0.6875em] h-1 w-1 shrink-0 rounded-full bg-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Value anchor */}
            <div className="mt-2 border-t border-line pt-7 text-center sm:pt-9">
              <p className="text-[15px] text-mute text-balance">{included.anchor.lead}</p>
              <p className="mt-2 font-display text-[30px] leading-snugger tracking-tightest text-bone sm:text-4xl lg:text-5xl">
                {included.anchor.close}
              </p>
            </div>

            {/* Checkout */}
            <div className="mt-8 flex flex-col items-center">
              <CtaButton section="included" label={hero.cta.label} block className="sm:w-auto" />
              <p className="mt-3 text-[13px] leading-snug text-mute">{offer.cancelLine}</p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
