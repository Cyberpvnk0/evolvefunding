import CtaButton from "@/components/ui/CtaButton";
import FadeUp from "@/components/motion/FadeUp";
import { hero, included, offer } from "@/content/site";

/**
 * 6. WHAT'S INCLUDED. Headline, then one dark card: the inclusions as a
 * hairline-separated list with a gold dot on each row, a hairline, the value
 * anchor (what others charge, what you pay), and a checkout button.
 *
 * The card is a single surface, not a grid. Everything inside it is server
 * rendered; only the fade-in wrapper and the button run on the client.
 */
export default function Included() {
  return (
    <section
      id="included"
      aria-labelledby="included-headline"
      className="px-5 py-20 sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-page">
        <FadeUp>
          <h2
            id="included-headline"
            className="max-w-[12ch] font-display text-[40px] leading-display tracking-tightest text-bone sm:text-6xl lg:text-7xl"
          >
            {included.headline}
          </h2>
          <div className="rule-gold mt-6" />
        </FadeUp>

        <FadeUp delay={0.08}>
          <div className="mt-10 max-w-2xl rounded-[3px] border border-line bg-ink-2 p-6 sm:mt-14 sm:p-10">
            {/* Inclusions */}
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
            <div className="mt-2 border-t border-line pt-6 sm:pt-8">
              <p className="text-[15px] text-mute text-balance">{included.anchor.lead}</p>
              <p className="mt-2 font-display text-[28px] leading-snugger tracking-tightest text-bone sm:text-4xl lg:text-5xl">
                {included.anchor.close}
              </p>
            </div>

            {/* Checkout */}
            <div className="mt-8">
              <CtaButton section="included" label={hero.cta.label} block className="sm:w-auto" />
              <p className="mt-3 text-[13px] leading-snug text-mute">{offer.cancelLine}</p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
