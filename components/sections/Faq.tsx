import CtaButton from "@/components/ui/CtaButton";
import FadeUp from "@/components/motion/FadeUp";
import FaqItem from "@/components/sections/FaqItem";
import { faq, faqSection, hero, offer } from "@/content/site";

/**
 * 8. FAQ. Headline, then the questions as a hairline-separated accordion,
 * then a modest checkout button with the cancel line under it.
 *
 * Every row is an independent toggle, all closed on load. The section is
 * server rendered; only each row's toggle and the fade-in wrappers run on the
 * client. A FAQPage JSON-LD block is built from the same array so the
 * questions can surface as a rich result in search.
 */
export default function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-headline"
      className="px-5 py-20 sm:px-8 sm:py-28 lg:py-36"
    >
      {/* Escape "<" so the copy can never close the script tag early. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-page">
        <FadeUp>
          <h2
            id="faq-headline"
            className="max-w-[12ch] font-display text-[40px] leading-display tracking-tightest text-bone sm:text-6xl lg:text-7xl"
          >
            {faqSection.headline}
          </h2>
          <div className="rule-gold mt-6" aria-hidden="true" />
        </FadeUp>

        {/* Accordion: hairline above each row, one more under the last. */}
        <div className="mt-10 max-w-3xl border-b border-line sm:mt-14">
          {faq.map((item, i) => (
            <FadeUp key={item.question} delay={Math.min(0.3, i * 0.06)} className="border-t border-line">
              <FaqItem id={`faq-${i + 1}`} question={item.question} answer={item.answer} />
            </FadeUp>
          ))}
        </div>

        {/* Checkout */}
        <FadeUp delay={0.1} className="mt-10 max-w-md sm:mt-12">
          <CtaButton section="faq" label={hero.cta.label} block className="sm:w-auto" />
          <p className="mt-3 text-[13px] leading-snug text-mute">{offer.cancelLine}</p>
        </FadeUp>
      </div>
    </section>
  );
}
