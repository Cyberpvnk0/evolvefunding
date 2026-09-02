import FadeUp from "@/components/motion/FadeUp";
import { guarantee } from "@/content/site";

/**
 * 8b. THE GUARANTEE. The last objection before the close: what happens if this
 * does not work.
 *
 * Given its own moment rather than buried in the FAQ, because on a page whose
 * only job is a purchase, removing the downside is the most valuable sentence
 * available. One raised panel over a pool of warm light, centred, with the
 * limitation stated plainly underneath rather than hidden: a guarantee that
 * visibly tells you where it stops is more believable than one that does not.
 */
export default function Guarantee() {
  return (
    <section
      id="guarantee"
      aria-labelledby="guarantee-headline"
      className="light-pool relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28 lg:py-32"
    >
      <div className="relative mx-auto max-w-page">
        <FadeUp>
          <div className="surface mx-auto flex max-w-3xl flex-col items-center rounded-[3px] px-6 py-10 text-center sm:px-12 sm:py-14">
            <ShieldMark />
            <p className="eyebrow mt-5 text-gold/85">{guarantee.eyebrow}</p>
            <h2
              id="guarantee-headline"
              className="mt-4 max-w-[20ch] font-display text-[30px] leading-snugger tracking-tightest text-bone sm:text-[44px]"
            >
              {guarantee.headline}
            </h2>
            <p className="mt-6 max-w-[52ch] text-[16px] leading-relaxed text-bone/85 sm:text-[17px]">
              {guarantee.body}
            </p>
            <div className="hairline mt-8 w-full" />
            <p className="mt-6 max-w-[56ch] text-[13px] leading-relaxed text-mute">
              {guarantee.fineprint}
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/** Line-drawn shield. The one icon on the page outside How It Works. */
function ShieldMark() {
  return (
    <svg
      aria-hidden="true"
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gold"
    >
      <path d="M19 3.5 5.5 8.5v9.2c0 8 5.6 13.9 13.5 16.8 7.9-2.9 13.5-8.8 13.5-16.8V8.5L19 3.5Z" />
      <path d="m13.5 18.8 3.9 3.9 7.1-7.9" />
    </svg>
  );
}
