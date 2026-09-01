import FadeUp from "@/components/motion/FadeUp";
import TestimonialCarousel from "@/components/sections/TestimonialCarousel";
import { testimonials, testimonialsSection } from "@/content/site";

/**
 * 7. TESTIMONIALS. Headline, then a swipeable row of client quotes: big serif
 * quote, 40px avatar, name, city. No cards, no stars, no autoplay.
 *
 * The headline is server rendered. The carousel is the only client piece, and
 * because it is a native scroll-snap track it swipes before it hydrates.
 */
export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-headline"
      className="px-5 py-20 sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-page">
        <FadeUp>
          <h2
            id="testimonials-headline"
            className="max-w-[12ch] font-display text-[40px] leading-display tracking-tightest text-bone sm:text-6xl lg:text-7xl"
          >
            {testimonialsSection.headline}
          </h2>
        </FadeUp>

        <FadeUp delay={0.08} className="mt-10 sm:mt-14">
          <TestimonialCarousel items={testimonials} />
        </FadeUp>
      </div>
    </section>
  );
}
