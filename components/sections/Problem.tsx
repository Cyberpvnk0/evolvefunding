import FadeUp from "@/components/motion/FadeUp";
import { problem } from "@/content/site";

/**
 * 4. THE PROBLEM. Three short statements stacked down the centre of the page,
 * a gold hairline, then the closer. Text only: no headline block, no icons,
 * no cards. The weight of the type is the whole design here.
 *
 * The section still needs a heading for landmark navigation, so the `h2` is
 * visually hidden and the three lines are plain paragraphs, each rising on its
 * own so they land one after another.
 */
export default function Problem() {
  return (
    <section
      id="problem"
      aria-labelledby="problem-headline"
      className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="mx-auto flex max-w-page flex-col items-center text-center">
        <h2 id="problem-headline" className="sr-only">
          The problem
        </h2>

        {/* The three statements */}
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          {problem.lines.map((line, i) => (
            <FadeUp key={line} delay={i * 0.08}>
              <p className="max-w-[18ch] font-display text-[32px] font-extrabold leading-snugger tracking-tightest text-bone text-balance sm:max-w-none sm:text-5xl lg:text-6xl">
                {line}
              </p>
            </FadeUp>
          ))}
        </div>

        {/* Closer */}
        <FadeUp delay={problem.lines.length * 0.08} className="flex flex-col items-center">
          <div className="rule-gold mt-9 sm:mt-11" />
          <p className="mt-7 max-w-[34ch] text-[17px] leading-relaxed text-bone/85 sm:mt-8 sm:max-w-prose sm:text-xl">
            {problem.closer}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
