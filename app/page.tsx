import Hero from "@/components/sections/Hero";
import StickyBar from "@/components/sections/StickyBar";
import ProofWall from "@/components/sections/ProofWall";
import ScoreStrip from "@/components/sections/ScoreStrip";
import Problem from "@/components/sections/Problem";
import HowItWorks from "@/components/sections/HowItWorks";
import Included from "@/components/sections/Included";
import Testimonials from "@/components/sections/Testimonials";
import Faq from "@/components/sections/Faq";
import Guarantee from "@/components/sections/Guarantee";
import FinalCta from "@/components/sections/FinalCta";
import Footer from "@/components/sections/Footer";
import ExitIntent from "@/components/ExitIntent";

/**
 * The funnel. One route, ten sections, one destination: checkout.
 * Section order is the conversion argument: proof first, then the cost of
 * inaction, then the mechanism, the offer, social proof, objections, close.
 */
export default function Page() {
  return (
    <>
      <main id="top">
        <Hero />
        <ProofWall />
        <ScoreStrip />
        <Problem />
        <HowItWorks />
        <Included />
        <Testimonials />
        <Faq />
        <Guarantee />
        <FinalCta />
      </main>
      <Footer />
      <StickyBar />
      <ExitIntent />
    </>
  );
}
