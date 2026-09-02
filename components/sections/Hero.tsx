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
  const vslMax = `min(900px, max(280px, calc((100svh - 580px) * ${ratio.toFixed(4)})))`;

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

      <div className="relative z-10 mx-auto flex w-full max-w-page flex-col items-center px-5 py-6 text-center sm:px-8 sm:py-8">
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
          className="light-pool relative mt-5 w-full [animation-delay:200ms] animate-fade-up sm:mt-6 sm:max-w-[var(--vsl-max)]"
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
        <div className="animate-fade-up mt-5 flex w-full max-w-md flex-col items-center [animation-delay:300ms] sm:mt-6">
          <CtaButton section="hero" label={hero.cta.label} block />
          <p className="mt-2.5 text-[12px] leading-snug text-mute sm:text-[13px]">{hero.cta.subtext}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-mute/80">
            <LockMark />
            {hero.cta.secure}
          </p>
        </div>

        {/*
          Proof bar. Three figures in equal columns, split by hairlines.
          The previous version mixed one large number with a wrapping list of
          differently-shaped items, so nothing lined up with anything. A fixed
          three-column grid makes the row read as one deliberate object: same
          column width, same baseline, same treatment for every figure.
        */}
        <ul
          className="surface-soft animate-fade-up mt-5 grid w-full max-w-md grid-cols-3 divide-x divide-line rounded-[3px] [animation-delay:400ms] sm:mt-6 sm:max-w-xl"
          aria-label="Results so far"
        >
          {hero.stats.map((stat) => {
            const target = Number.parseFloat(stat.value);
            const animates = stat.countFrom !== undefined && Number.isFinite(target);
            return (
              <li key={stat.label} className="flex flex-col items-center px-2 py-3.5 text-center sm:px-4 sm:py-4">
                <span className="font-display text-[26px] font-extrabold leading-none tracking-tightest text-gold sm:text-[32px]">
                  {stat.prefix}
                  {animates ? (
                    <CountUp
                      from={stat.countFrom as number}
                      to={target}
                      durationMs={stat.durationMs ?? 2000}
                    />
                  ) : (
                    stat.value
                  )}
                  {stat.suffix}
                </span>
                <span className="mt-2 text-[10px] font-semibold uppercase leading-tight tracking-[0.07em] text-mute sm:text-[11px]">
                  {stat.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Small closed padlock, shown beside the secure-checkout line. */
function LockMark() {
  return (
    <svg
      aria-hidden="true"
      width="11"
      height="11"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="6" width="9" height="6.5" rx="1" />
      <path d="M4.75 6V4.25a2.25 2.25 0 0 1 4.5 0V6" />
    </svg>
  );
}
