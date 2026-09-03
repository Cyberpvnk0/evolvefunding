import FadeUp from "@/components/motion/FadeUp";
import StepIcon from "@/components/ui/StepIcon";
import SectionHeading from "@/components/ui/SectionHeading";
import { howItWorks } from "@/content/site";

/**
 * 5. HOW IT WORKS. The three steps as a centered ordered list: gold line icon,
 * step number, title, one line of body.
 *
 * Each step sits on its own soft surface rather than on the flat page, which
 * gives the row some physical depth without turning into an icon-card grid:
 * no heavy borders, no radius beyond the 3px used everywhere else, and the
 * icon reads as a mark rather than a badge. Sized to stay on one phone screen.
 */
export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-headline"
      className="relative overflow-hidden px-5 py-10 sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-page">
        <FadeUp>
          <SectionHeading
            id="how-it-works-headline"
            headline={howItWorks.headline}
            sub={howItWorks.sub}
          />
        </FadeUp>

        <ol className="mx-auto mt-6 grid max-w-4xl gap-1.5 sm:mt-14 sm:gap-4 lg:grid-cols-3">
          {howItWorks.steps.map((step, i) => (
            <li key={step.title}>
              <FadeUp
                delay={0.08 + i * 0.08}
                className="surface-soft flex h-full flex-col items-center rounded-[3px] px-5 py-3.5 text-center sm:px-6 sm:py-8"
              >
                {/* Icon and step number share a line on phones: the section has
                    to stay inside one screen, and this is the cheapest 24px. */}
                <span className="flex items-center gap-2.5 sm:flex-col sm:gap-0">
                  <StepIcon name={step.icon} className="h-6 w-6 text-gold sm:h-7 sm:w-7" />
                  <span className="eyebrow tabular sm:mt-4">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <h3 className="mt-2 font-display text-[21px] leading-snugger text-bone sm:mt-2 sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-1.5 max-w-[34ch] text-[14px] leading-relaxed text-mute sm:mt-2.5 sm:text-[15px]">
                  {step.body}
                </p>
              </FadeUp>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
