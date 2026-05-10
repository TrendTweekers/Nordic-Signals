import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { SampleSignals } from "@/components/SampleSignals";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <a id="top" />
      <Nav />
      <main>
        <Hero />
        <section id="how">
          <HowItWorks />
        </section>
        <section id="signals">
          <SampleSignals />
        </section>
        <section id="pricing">
          <Pricing />
        </section>
        <section id="subscribe" />
      </main>
      <Footer />
    </>
  );
}
