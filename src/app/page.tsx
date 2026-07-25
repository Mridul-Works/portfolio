import Contact from "@/components/Contact";
import FloatingCta from "@/components/FloatingCta";
import Hero from "@/components/Hero";
import Invest from "@/components/Invest";
import Manifesto from "@/components/Manifesto";
import Method from "@/components/Method";
import Showcase from "@/components/Showcase";
import Signature from "@/components/Signature";

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <Signature />
      <Showcase />
      <Method />
      <Invest />
      <Contact />
      <FloatingCta />
    </main>
  );
}
