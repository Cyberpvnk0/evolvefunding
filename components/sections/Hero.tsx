import Image from "next/image";
import CtaButton from "@/components/ui/CtaButton";
import CountUp from "@/components/motion/CountUp";
import VslPlayer from "@/components/sections/VslPlayer";
import { hero } from "@/content/site";

/**
 * 1. HERO. Built around the video sales letter.
 *
 * Stacking order, top to bottom: headline, one-line subhead, the VSL, the buy
 * button, then a compact proof strip (score jump + trust items). All of it is
 * sized to fit inside one viewport at 390px without scrolling, which is the
 * constraint that drives every type size and gap here. The section is a
 * flex column with `justify-center`, so on a tall screen the block centres and
 * on a short one it packs from the top and the gaps take the strain.
 *
 * The VSL poster is the only priority image on the page, since it is the LCP
 * element and the thing the visitor is meant to press.
 *
 * Above-the-fold content uses CSS `animate-fade-up` (not <FadeUp />) so the
 * first paint never waits for hydration. The h1 uses the transform-only
 * `animate-slide-up` instead: a fade from opacity 0 would keep it out of the
 * LCP candidates, so it must paint visible on the first frame.
 */
export default function Hero() {
  /**
   * Cap the video by the height available rather than by width alone.
   * Everything around it (headline, subhead, hint, button, proof strip and
   * padding) measures a fixed ~500px on desktop, so on a short laptop a
   * 900px-wide 16:9 video pushes the headline off the top of the screen.
   * Deriving the cap from the viewport height and the configured ratio keeps
   * the whole hero inside one screen at any window size.
   *
   * Applied from `sm` up only. Phone type is smaller, so the hero already fits
   * there on its own, and a short phone would otherwise hit this bound and
   * shrink the video for no reason. The inner `max()` floors it so a landscape
   * phone cannot drive the expression negative.
   */
  const [aw, ah] = hero.vsl.aspect.split("/").map((n) => Number.parseFloat(n.trim()));
  const ratio = aw > 0 && ah > 0 ? aw / ah : 16 / 9;
  const vslMax = `min(900px, max(280px, calc((100svh - 520px) * ${ratio.toFixed(4)})))`;

  return (
    <section
      id="hero"
      aria-labelledby="hero-headline"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-ink"
    >
      {/* Backdrop: a dark still, held well back so the video owns the screen. */}
      <div className="vignette absolute inset-0">
        <Image
          src={hero.backdrop}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(orientation: portrait) 90vh, 60vw"
          quality={45}
          className="object-cover opacity-40"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-page flex-col items-center px-5 py-8 text-center sm:px-8 sm:py-10">
        <h1
          id="hero-headline"
          className="animate-slide-up max-w-[18ch] font-display text-[34px] leading-display tracking-tightest text-bone sm:text-6xl lg:text-7xl"
        >
          {hero.headline}
        </h1>

        <p className="animate-fade-up mt-3 max-w-[44ch] text-[15px] leading-relaxed text-bone/80 [animation-delay:100ms] sm:mt-4 sm:text-lg">
          {hero.subheadline}
        </p>

        {/* The centrepiece. */}
        <div
          className="light-pool relative mt-5 w-full [animation-delay:200ms] animate-fade-up sm:mt-7 sm:max-w-[var(--vsl-max)]"
          style={{ "--vsl-max": vslMax } as React.CSSProperties}
        >
          <VslPlayer vsl={hero.vsl} priority />
          {hero.vsl.hint ? (
            <p className="mt-2.5 text-[12px] tracking-[0.04em] text-mute sm:mt-3 sm:text-[13px]">
              {hero.vsl.hint}
            </p>
          ) : null}
        </div>

        {/* Buy button, directly under the video. */}
        <div className="animate-fade-up mt-5 w-full max-w-md [animation-delay:300ms] sm:mt-7">
          <CtaButton section="hero" label={hero.cta.label} block />
          <p className="mt-2.5 text-[12px] leading-snug text-mute sm:text-[13px]">{hero.cta.subtext}</p>
        </div>

        {/* Compact proof strip: the score jump, then the trust items. */}
        <div className="animate-fade-up mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 [animation-delay:400ms] sm:mt-7 sm:gap-x-7">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-[28px] leading-none tracking-tightest text-gold sm:text-[34px]">
              <CountUp
                from={hero.counter.from}
                to={hero.counter.to}
                durationMs={hero.counter.durationMs}
              />
            </span>
            <span className="eyebrow leading-snug">{hero.counter.label}</span>
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Trust">
            {hero.trust.map((item) => (
              <li key={item} className="eyebrow flex items-center gap-2 text-bone/70">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
