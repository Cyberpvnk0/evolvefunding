import FadeUp from "@/components/motion/FadeUp";
import TestimonialCarousel from "@/components/sections/TestimonialCarousel";
import SectionHeading from "@/components/ui/SectionHeading";
import { testimonials, testimonialsSection } from "@/content/site";

/**
 * 7. TESTIMONIALS. Centred heading, then a swipeable row of client quotes.
 * No cards, no stars, no autoplay: the words carry it.
 *
 * The heading is server rendered. The carousel is the only client piece, and
 * because it is a native scroll-snap track it swipes before it hydrates.
 */
export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-headline"
      className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-page">
        <FadeUp>
          <SectionHeading id="testimonials-headline" headline={testimonialsSection.headline} />
        </FadeUp>

        <FadeUp delay={0.08} className="mt-10 sm:mt-14">
          <TestimonialCarousel items={testimonials} />
        </FadeUp>
      </div>
    </section>
  );
}
