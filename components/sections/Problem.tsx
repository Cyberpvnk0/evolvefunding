import FadeUp from "@/components/motion/FadeUp";
import { problem } from "@/content/site";

/**
 * 4. THE PROBLEM. Three short serif statements stacked down the page, a gold
 * hairline, then the closer. Text only: no headline block, no icons, no cards.
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
      className="px-5 py-20 sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-page">
        <h2 id="problem-headline" className="sr-only">
          The problem
        </h2>

        {/* The three statements */}
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          {problem.lines.map((line, i) => (
            <FadeUp key={line} delay={i * 0.08}>
              <p className="font-display text-[34px] leading-snugger tracking-tightest text-bone text-balance sm:text-5xl lg:text-6xl">
                {line}
              </p>
            </FadeUp>
          ))}
        </div>

        {/* Closer */}
        <FadeUp delay={problem.lines.length * 0.08}>
          <div className="rule-gold mt-8 sm:mt-10" />
          <p className="mt-6 max-w-prose font-sans text-[17px] leading-relaxed text-bone/85 sm:mt-8 sm:text-xl">
            {problem.closer}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
