import Contact from "@/components/Contact";
import FloatingCta from "@/components/FloatingCta";
import Hero from "@/components/Hero";
import Hire from "@/components/Hire";
import Manifesto from "@/components/Manifesto";
import Method from "@/components/Method";
import Record from "@/components/Record";
import Showcase from "@/components/Showcase";
import Signature from "@/components/Signature";

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <Signature />
      <Showcase />
      <Record />
      {/* <Method /> */}
      <Hire />
      <Contact />
      <FloatingCta />
    </main>
  );
}
