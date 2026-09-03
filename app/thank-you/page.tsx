import type { Metadata } from "next";
import FadeUp from "@/components/motion/FadeUp";
import SubpageShell from "@/components/ui/SubpageShell";
import TextButton from "@/components/ui/TextButton";
import { brand, thankYou } from "@/content/site";

export const metadata: Metadata = {
  title: `${thankYou.title} | ${brand.name}`,
  robots: { index: false, follow: false },
};

/**
 * THANK-YOU. Where checkout lands. Confirms the payment, lists the three
 * things to do now, walks through the first week, then offers a text line
 * for questions. No checkout button: they already bought.
 *
 * Above the fold uses CSS `animate-fade-up` like the hero so the first paint
 * never waits for hydration. The first-week block and the text button are
 * further down and enter with <FadeUp /> on scroll.
 */
export default function ThankYouPage() {
  return (
    <SubpageShell>
      <div className="max-w-3xl">
        <h1 className="animate-fade-up font-display text-[56px] leading-display tracking-tightest text-bone sm:text-8xl">
          {thankYou.headline}
        </h1>

        <p className="animate-fade-up mt-5 max-w-prose text-lg leading-relaxed text-bone/80 [animation-delay:120ms] sm:mt-6">
          {thankYou.subheadline}
        </p>

        {/* Next steps: hairline above each row, one more under the last. */}
        <ol
          className="animate-fade-up mt-12 border-b border-line [animation-delay:240ms] sm:mt-16"
          aria-label="Next steps"
        >
          {thankYou.nextSteps.map((step, i) => (
            <li key={step.title} className="border-t border-line py-6 sm:py-7">
              <span className="eyebrow tabular">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-2 font-display text-[26px] leading-snugger tracking-tightest text-bone sm:text-3xl">
                {step.title}
              </h2>
              <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-mute">{step.body}</p>
            </li>
          ))}
        </ol>

        {/* First week */}
        <section aria-labelledby="first-week-headline" className="mt-16 sm:mt-24">
          <FadeUp>
            <h2
              id="first-week-headline"
              className="max-w-[12ch] font-display text-[38px] leading-display tracking-tightest text-bone sm:text-6xl"
            >
              {thankYou.firstWeek.headline}
            </h2>
          </FadeUp>

          <FadeUp delay={0.08}>
            <dl className="mt-8 border-b border-line sm:mt-10">
              {thankYou.firstWeek.days.map((entry) => (
                <div
                  key={entry.day}
                  className="border-t border-line py-4 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-x-8 sm:py-5"
                >
                  {/* Nudged down on sm so the 11px label sits on the center of the body's first line. */}
                  <dt className="eyebrow sm:pt-[5px]">{entry.day}</dt>
                  <dd className="mt-1.5 text-[16px] leading-relaxed text-bone/85 sm:mt-0">{entry.body}</dd>
                </div>
              ))}
            </dl>
          </FadeUp>
        </section>

        {/* Text line */}
        <FadeUp delay={0.1} className="mt-12 max-w-md sm:mt-16">
          <TextButton label={thankYou.cta.label} block className="sm:w-auto" />
          <p className="mt-3 text-[13px] leading-snug text-mute">{thankYou.cta.subtext}</p>
          <a
            href={`mailto:${brand.email}`}
            className="mt-4 inline-flex min-h-11 items-center text-[14px] text-mute transition-colors duration-200 ease-expensive hover:text-bone"
          >
            {brand.email}
          </a>
        </FadeUp>
      </div>
    </SubpageShell>
  );
}
