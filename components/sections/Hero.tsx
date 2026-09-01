import Image from "next/image";
import CtaButton from "@/components/ui/CtaButton";
import CountUp from "@/components/motion/CountUp";
import HeroVideo from "@/components/sections/HeroVideo";
import { hero } from "@/content/site";

/**
 * 1. HERO. Full viewport, video background with poster fallback, headline,
 * subheadline, live score counter, gold CTA, trust row.
 *
 * Above-the-fold content uses CSS `animate-fade-up` (not <FadeUp />) so the
 * first paint never waits for hydration.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-headline"
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink"
    >
      {/* Photography layer: poster (LCP, preloaded) with the video fading in over it. */}
      <div className="vignette absolute inset-0">
        <Image
          src={hero.poster}
          alt={hero.posterAlt}
          fill
          priority
          sizes="100vw"
          quality={70}
          className="object-cover"
        />
        <HeroVideo src={hero.video} poster={hero.poster} />
      </div>

      {/* Copy layer */}
      <div className="relative z-10 mx-auto w-full max-w-page px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:pb-24">
        <h1
          id="hero-headline"
          className="animate-fade-up max-w-[11ch] font-display text-[46px] leading-display tracking-tightest text-bone sm:text-7xl lg:text-8xl"
        >
          {hero.headline}
        </h1>

        <p className="animate-fade-up mt-5 max-w-[34rem] text-[16px] leading-relaxed text-bone/80 [animation-delay:120ms] sm:mt-6 sm:text-lg">
          {hero.subheadline}
        </p>

        {/* Live counter */}
        <div className="animate-fade-up mt-7 flex items-end gap-4 [animation-delay:240ms] sm:mt-9">
          <CountUp
            from={hero.counter.from}
            to={hero.counter.to}
            durationMs={hero.counter.durationMs}
            className="font-display text-[72px] leading-[0.85] tracking-tightest text-gold sm:text-[96px]"
          />
          <span className="eyebrow mb-1 max-w-[9rem] leading-snug sm:max-w-none">{hero.counter.label}</span>
        </div>

        {/* Primary CTA */}
        <div className="animate-fade-up mt-8 max-w-md [animation-delay:360ms] sm:mt-10">
          <CtaButton section="hero" label={hero.cta.label} block />
          <p className="mt-3 text-[13px] leading-snug text-mute">{hero.cta.subtext}</p>
        </div>

        {/* Trust row */}
        <ul className="animate-fade-up mt-8 flex flex-wrap gap-x-6 gap-y-2 [animation-delay:480ms] sm:mt-10" aria-label="Trust">
          {hero.trust.map((item) => (
            <li key={item} className="eyebrow flex items-center gap-2 text-bone/70">
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gold" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
