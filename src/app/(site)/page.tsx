import Hero from "@/components/sections/Hero";
import StorySection from "@/components/sections/StorySection";
import MenuCatalog from "@/components/menu/MenuCatalog";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <StorySection />
        <MenuCatalog />
      </main>
      <Footer />
    </>
  );
}
