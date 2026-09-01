import CtaButton from "@/components/ui/CtaButton";
import FadeUp from "@/components/motion/FadeUp";
import { ProofGallery } from "@/components/sections/ProofCard";
import { hero, proof, proofClients } from "@/content/site";

/**
 * 3. PROOF WALL. The emotional core of the page: a wall of client photos with
 * the score under each one. Tap a photo, see the bureau screenshot.
 *
 * Server component. Heading and CTA render on the server; the gallery (which
 * owns the lightbox state) is the one client leaf, exported from ProofCard.tsx.
 */
export default function ProofWall() {
  return (
    <section
      id="proof"
      aria-labelledby="proof-headline"
      className="bg-ink px-5 py-20 sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-page">
        <FadeUp>
          <h2
            id="proof-headline"
            className="max-w-[12ch] font-display text-[40px] leading-display tracking-tightest text-bone sm:text-6xl lg:text-7xl"
          >
            {proof.headline}
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-mute">{proof.subheadline}</p>
          <div className="rule-gold mt-6" aria-hidden="true" />
        </FadeUp>

        <FadeUp delay={0.1} className="mt-10 sm:mt-14">
          <ProofGallery clients={proofClients} />
        </FadeUp>

        {/* Full width on phones, centered auto width from sm. */}
        <FadeUp delay={0.06} className="mt-10 sm:mt-14 sm:text-center">
          <CtaButton section="proof" label={hero.cta.label} block className="sm:w-auto" />
          <p className="mt-3 text-[13px] leading-snug text-mute">{hero.cta.subtext}</p>
        </FadeUp>
      </div>
    </section>
  );
}
