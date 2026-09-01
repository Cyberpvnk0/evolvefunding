import FadeUp from "@/components/motion/FadeUp";
import StepIcon from "@/components/ui/StepIcon";
import { howItWorks } from "@/content/site";

/**
 * 5. HOW IT WORKS. Headline, then the three steps as an ordered list: gold line
 * icon on the left, step number, serif title, one-line body.
 *
 * Sized to fit one phone screen, so no eyebrow or gold rule above the headline
 * and a tight vertical rhythm with hairlines between rows. From `lg` the rows
 * become three columns, each carrying its own hairline on top.
 */
export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-headline"
      className="px-5 py-20 sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-page">
        <FadeUp>
          <h2
            id="how-it-works-headline"
            className="max-w-[12ch] font-display text-[40px] leading-display tracking-tightest text-bone sm:text-6xl lg:text-7xl"
          >
            {howItWorks.headline}
          </h2>
        </FadeUp>

        {/* Steps */}
        <ol className="mt-10 sm:mt-14 lg:grid lg:grid-cols-3 lg:gap-x-10">
          {howItWorks.steps.map((step, i) => (
            <li
              key={step.title}
              className="border-t border-line py-5 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-5"
            >
              <FadeUp delay={0.08 + i * 0.08} className="flex gap-4">
                <StepIcon name={step.icon} className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
                <div className="min-w-0">
                  <span className="eyebrow tabular">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-display text-[26px] leading-snugger tracking-tightest text-bone sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-mute">{step.body}</p>
                </div>
              </FadeUp>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
