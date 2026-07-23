import About from "@/components/About";
import Contact from "@/components/Contact";
import Craft from "@/components/Craft";
import Feedback from "@/components/Feedback";
import Hero from "@/components/Hero";
import ModernWeb from "@/components/ModernWeb";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Craft />
      <ModernWeb />
      <Feedback />
      <Contact />
    </main>
  );
}
